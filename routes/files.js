const router = express.Router();
const express = require("express");
const multer = require("multer");
const path = require("path");

const { File, DateRecord } = require("../models");
const { findByPk } = require("../models/dateRecords");


let storage = multer.diskStorage({
  destination: function(req, file ,callback){
      callback(null, "upload/")
  },
  filename: function(req, file, callback){
      let extension = path.extname(file.originalname);
      let basename = path.basename(file.originalname, extension);
      callback(null, basename + "-" + Date.now() + extension);
  }
});

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, new Date().valueOf() + path.extname(file.originalname));
    }
  }),
});

// UD도 추가필요
// read
router.get('/', function(req, res, next) {
  try {
    let file = await File.findAll({
      where: { dateRecord_id: req.body.id },
    });
    if (!file) {
      return res.status(404).json(getFailure(req.originalUrl));
    }

    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// upload
router.post('/', upload.single("img"), function(req, res, next) {
  // 크기제한 (100MB)
  // multer({ dest: 'uploads/', limits: { fileSize: 100 * 1024 * 1024 } });
  try {
    let file = req.file
    let originalUrl = file.location;
    let fileType = file.mimetype.split("/")[file.mimetype.split("/").length - 1];

    let record = await DateRecord.findByPk(res.body.id);
    if (!record) {
      return res.status(404).json(getFailure(req.originalUrl));
    }

    const upload = await File.create({
      file_type: fileType,
      size: file.size,
      original_url: originalUrl,
      description: req.body.description,
    });
    if (!upload) {
      return res.status(500).json(getFailure(`db error: create`));
    }
    record = await record.addFild(upload);
    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});

// update
router.post('/', upload.single("img"), function(req, res, next) {
  try {
    let file = req.file
    let originalUrl = file.location;
    let fileType = file.mimetype.split("/")[file.mimetype.split("/").length - 1];

    let record = await DateRecord.findByPk(res.body.id);
    if (!record) {
      return res.status(404).json(getFailure(req.originalUrl));
    }

    const update = await File.update({
      file_type: fileType,
      size: file.size,
      original_url: originalUrl,
      description: req.body.description,
    });
    if (!upload) {
      return res.status(500).json(getFailure(`db error: create`));
    }
    record = await record.addFild(upload);
    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});



module.exports = router;
