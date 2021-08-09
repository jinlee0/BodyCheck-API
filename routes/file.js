const router = express.Router();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");

const { File, DateRecord } = require("../models");
const { findByPk } = require("../models/record");


AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});
const s3 = new AWS.S3();

var upload = multer({
  storage: multerS3({
    s3,
    bucket: "sotabodycheck",
    key(req, file, cb) {
      const fileType =
        file.mimetype.split("/")[file.mimetype.split("/").length - 1];
      if (fileType == "image") {
        console.log("imageFile upload.");
        cb(null, `images/${Date.now()}${path.basename(file.originalname)}`);
      } else if (fileType == "video") {
        console.log("videoFile upload.");
        cb(null, `videos/${Date.now()}${path.basename(file.originalname)}`);
      } else {
        console.log("documentFile upload.");
        cb(null, `documents/${Date.now()}${path.basename(file.originalname)}`);
      }
    },
  }),
});

// Read
router.get(
  "/read/:id",
  async (req, res, next) => {
    try {
      let files = await File.findAll({
        where: { dateRecord_id: req.params.id },
      });
      res.json(files);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// Create
router.post(
  "/upload/:id",
  upload.array("files"),
  async (req, res) => {
    console.log(req.files);

    // const urls = [];
    let fileType, url, originalUrl;
    let record = await DateRecord.findOne({
      where: { id: req.params.id },
      include: [File],
    });
    req.files.map(async (file) => {
      fileType = file.mimetype.split("/")[file.mimetype.split("/").length - 1];
      if (fileType == "image") {
        originalUrl = file.location;
        url = originalUrl.replace(/\/images\//, "/thumb/");

        console.log(originalUrl);
        onsole.log(url);
      } else {
        url = file.location;
        originalUrl = file.location;

        console.log(originalUrl);
        console.log(url);
      }

      const uploaded = await File.create({
        file_type: fileType,
        original_url: originalUrl,
        url: url,
        description: req.body.description,
      });
      record = await DateRecord.addFile(uploaded);
    });
    console.log(record.Files);

    res.json(record.files);
  }
);

// Delete
router.delete(
  "/delete/:fileId",
  async (req, res, next) => {
    try {
      const file = await File.findByPk(req.params.fileId);
      const url = file.url.split("/"); // file에 저장된 fileUrl을 가져옴
      const originalUrl = file.original_url;

      const delFileName = url[url.length - 1]; // 버킷에 저장된 객체 URL만 가져옴
      const params = {
        Bucket: "sotabodycheck/documents",
        Key: delFileName,
      };
      if (file.file_type === "image") {
        await s3.deleteObject(params, function (err, data) {
          if (err) {
            console.log("aws delete error");
            console.log(err, err.stack);
            res.redirect("/");
          } else {
            console.log("aws delete success" + data);
          }
          console.log("리사이즈 파일 삭제");
        });
      }
      await s3.deleteObject(params, function (err, data) {
        if (err) {
          console.log("aws delete error");
          console.log(err, err.stack);
          res.redirect("/");
        } else {
          console.log("aws delete success" + data);
        }
      });
      const deleted = await File.destroy({
        where: { id: req.params.fileId },
      });

      console.log("파일 삭제");
      res.json(deleted);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

module.exports = router;
