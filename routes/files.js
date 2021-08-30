const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isLoggedIn, getValidationError, getNoSuchResource, getSuccess, getFailure } = require('./middlewares');
const { File, DateRecord } = require("../models");

try {
  fs.readdirSync('uploads');
} catch(err) {
  console.error('uploads 폴더가 없어 생성');
  fs.mkdirSync('uploads');
}

//multer
multer({ dest: 'uploads/' });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log(file);
    const ext = path.extname(file.originalname);
    cb(null, path.basename(file.originalname, ext) + Date.now() + ext); // 중복방지
  }
});
// 사진 크기제한 (30MB)
const upload = multer({ storage: storage, limits: { fileSize: 30 * 1024 * 1024 } });
// 영상 크기제한 (100MB)
const upload2 = multer({ storage: storage, limits: { fileSize: 100 * 1024 * 1024 } });


// 사진
// upload
router.post(
  '/img', 
  isLoggedIn, 
  upload.single("img"), async  function(req, res, next) {
  try {
    // body { DateRecordId }
    const {DateRecordId, description} = req.body;
    const file = req.file;
    const originalUrl = file.path;
    const fileType = path.basename(file.mimetype);

    if(!DateRecordId){
      return res.status(400).json(getFailure(req.originalUrl + `DateRecordId=${DateRecordId}`));
    }

    let dateRecord = await DateRecord.findOne({
      where: { id: DateRecordId },
      include: [File]
    })
    if (!dateRecord) {
      return res.status(404).json(getFailure(`does not found dateRecord via id`));
    }

    const upload = await File.create({
      name: file.filename,
      file_type: fileType,
      size: file.size, // kb단위
      origin_url: originalUrl,
      description,
    });
    if (!upload) {
      return res.status(500).json(getFailure(`db error: create`));
    }

    await dateRecord.addFiles(upload);
    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});


// 영상
// upload
router.post(
  '/video', 
  upload2.single("video"), async  function(req, res, next) {
  try {
    // body { DateRecordId }
    const {DateRecordId, description} = req.body;
    const file = req.file
    const originalUrl = file.path;
    const fileType = path.basename(file.mimetype);

    if(!DateRecordId){
      return res.status(400).json(getFailure(req.originalUrl + `DateRecordId=${DateRecordId}`));
    }

    let dateRecord = await DateRecord.findOne({
      where: { id: DateRecordId },
      include: [File]
    })
    console.log(file);
    if (!dateRecord) {
      return res.status(404).json(getFailure(`does not found dateRecord via id`));
    }

    const upload = await File.create({
      name: file.filename,
      file_type: fileType,
      size: file.size, // kb단위
      origin_url: originalUrl,
      description,
    });
    if (!upload) {
      return res.status(500).json(getFailure(`db error: create`));
    }

    await dateRecord.addFiles(upload);
    return res.status(201).json(getSuccess(upload));
  } catch(error) {
    console.error(error);
    next(error);
  }
});



// read
router.get(
  '/', 
  async function(req, res, next) {
  try {
    const {DateRecordId} = req.query;
    let where = {};
    if(DateRecordId){
      const dateRecord = await DateRecord.findByPk(DateRecordId);
      if(!dateRecord){
        return res.status(404).json(getFailure(req.originalUrl + ' does not found DateRecord via DateReocrdId'));
      }
      where.dateRecord_id = DateRecordId;
    }
    const files = await File.findAll({where});
    if (files.length === 0) {
      return res.status(204).json();
    }
    return res.status(200).json(getSuccess(files));
  } catch(error) {
    console.error(error);
    next(error);
  }
});


router.get(
  '/:id/download', 
  async function(req, res, next) {
  try {
    const {id} = req.params;
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json(getFailure(`does not found file via id`));
    }
    return res.status(200).download(file.origin_url);
  } catch(error) {
    console.error(error);
    next(error);
  }
});

router.get(
  '/:id', 
  async function(req, res, next) {
  try {
    const {id} = req.params;
    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json(getFailure(`does not found file via id`));
    }
    return res.status(200).json(getSuccess(file));
  } catch(error) {
    console.error(error);
    next(error);
  }
});



// delete
router.delete(
  '/:id',  
  async function(req, res, next) {
  try {
    const {id} = req.params;

    const file = await File.findByPk(id);
    if (!file) {
      return res.status(404).json(getFailure(`does not found file via id`));
    }

    if(!fs.existsSync(file.origin_url)){
      return res.status(500).json(getFailure('db에서 파일 경로를 찾았는데 실제 경로엔 없네요...'));
    }

    fs.unlinkSync(file.origin_url, (err) => {
      console.error(err);
    })
    await file.destroy();

    return res.status(204).json();
  } catch(error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
