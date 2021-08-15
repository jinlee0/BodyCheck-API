const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLoggedIn, getValidationError, getNoSuchResource, getSuccess, getFailure } = require('./middlewares');
const { File, DateRecord } = require("../models");

//multer
multer({ dest: 'uploads/' });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().valueOf() + path.extname(file.originalname)); // 중복방지
  }
});
// 사진 크기제한 (30MB)
const upload = multer({ storage: storage, limits: { fileSize: 30 * 1024 * 1024 } });
// 영상 크기제한 (100MB)
const upload2 = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });

// read
router.get(
  '/:id', 
  isLoggedIn,
  async function(req, res, next) {
  try {
    const file = await File.findAll({
      where: { date_record_id: req.params.id }
    })
    if (!file) {
      return res.status(404).json(getFailure(`does not found file via dateRecordId`));
    }

    return res.status(201).json(getSuccess(file));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// 사진
// upload
router.post(
  '/img', 
  isLoggedIn, 
  upload.single("img"), async  function(req, res, next) {
  try {
    const file = req.file
    const originalUrl = file.path;
    const fileType = file.mimetype.split("/")[file.mimetype.split("/").length - 1];

    let record = await DateRecord.findOne({
      where: { id: req.body.id },
      include: [File]
    })
    console.log(file);
    if (!record) {
      return res.status(404).json(getFailure(`does not found dateRecord via id`));
    }

    const upload = await File.create({
      name: file.filename,
      file_type: fileType,
      size: file.size, // kb단위
      original_url: originalUrl,
      description: req.body.description,
    });
    if (!upload) {
      return res.status(500).json(getFailure(`db error: create`));
    }

    record = await record.addFile(upload);
    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// delete
router.delete(
  '/img',  
  isLoggedIn, 
  upload.single("img"), async function(req, res, next) {
  try {
    let fileId = req.body.fileId;

    let record = await DateRecord.findOne({
      where: { id: req.body.id },
      include: [File]
    })
    if (!record) {
      return res.status(404).json(getFailure(`does not found dateRecord via id`));
    }

    let deleted = await File.findByPk(fileId);
    if (!deleted) {
      return res.status(404).json(getFailure(`does not found file via id`));
    }

    deleted = await deleted.destroy();
    if (!deleted) {
      return res.status(500).json(getFailure(`db error: destroy`));
    }
    return res.status(201).json(getSuccess(deleted));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// 영상
// upload
router.post(
  '/video', 
  isLoggedIn, 
  upload2.single("video"), async  function(req, res, next) {
  try {
    const file = req.file
    const originalUrl = file.path;
    const fileType = file.mimetype.split("/")[file.mimetype.split("/").length - 1];

    let record = await DateRecord.findOne({
      where: { id: req.body.id },
      include: [File]
    })
    console.log(file);
    if (!record) {
      return res.status(404).json(getFailure(`does not found dateRecord via id`));
    }

    const upload = await File.create({
      name: file.filename,
      file_type: fileType,
      size: file.size, // kb단위
      original_url: originalUrl,
      description: req.body.description,
    });
    if (!upload) {
      return res.status(500).json(getFailure(`db error: create`));
    }

    record = await record.addFile(upload);
    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// delete
router.delete(
  '/video',  
  isLoggedIn, 
  upload2.single("video"), async function(req, res, next) {
  try {
    let fileId = req.body.fileId;

    let record = await DateRecord.findOne({
      where: { id: req.body.id },
      include: [File]
    })
    if (!record) {
      return res.status(404).json(getFailure(`does not found dateRecord via id`));
    }

    let deleted = await File.findByPk(fileId);
    if (!deleted) {
      return res.status(404).json(getFailure(`does not found file via id`));
    }

    deleted = await deleted.destroy();
    if (!deleted) {
      return res.status(500).json(getFailure(`db error: destroy`));
    }
    return res.status(201).json(getSuccess(deleted));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
