const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("./middlewares");
const { File, DateRecord, Record } = require("../models");
const router = express.Router();
const upload = multer();

// Read
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    const Id = req.body.id;
    if (!Id) {
      return res.status(400).json(getFailure(`${req.originalUrl} At least one content is required`));
    }
    const record = await DateRecord.findOne(
      { 
        where: { id: req.body.id },
        include: [File]
      }
    );
    if (!record) {
      return res.status(404).json(getFailure(req.originalUrl));
    }

    return res.status(200).json(getSuccess(record));
  } catch (error) {
    console.error(error);
    next(error);
  }
}
);

// Create
router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  const {
    date,
    startTime,
    endTime,
    memo
  } = req.body;
  // 누락 확인
  if (!date || !startTime || !endTime || !memo) {
    return res.status(400).json(getFailure(`${req.originalUrl} At least one content is required`));
  }
},
async (req, res, next) => {
  const {
    date,
    startTime,
    endTime,
    memo
  } = req.body;
  const record = await DateRecord.create({
    date,
    startTime,
    endTime,
    memo,
  });
  if(!record){
    return res.status(500).json(getFailure(`db error: create`));
  }
  return res.status(201).json(getSuccess(record));
});

// Update
router.post("/", isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const {
      date,
      startTime,
      endTime,
      memo
    } = req.body;

    const record = await DateRecord.findOne(
      { 
        where: { id: req.body.id }
      });
    if (!record) {
        return res.status(404).json(getFailure(req.originalUrl));
    }

    // 누락 확인
    if (!date || !startTime || !endTime || !memo) {
      return res.status(400).json(getFailure(`${req.originalUrl} At least one content is required`));
    }

    // 중복확인
    let data = {
      date: record.getDataValue('date'),
      startTime: record.getDataValue('startTime'),
      endTime: record.getDataValue('endTime'),
      memo: record.getDataValue('memo'),
    }
    if(JSON.stringify(data) == JSON.stringify(record.dataValues)){
      return res.status(204).json();
    }

    await record.update({
      date,
      startTime,
      endTime,
      memo,
    },
      { where: { id: req.body.id } }
    );
    return res.status(201).json(getSuccess(record));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Delete
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await DateRecord.findOne(
      {
        where: { id: req.body.id }
      });
    if (!record) {
        return res.status(404).json(getFailure(`there is no dateRecord where id=${id}`));
    }
    
    await DateRecord.destroy();
    return res.status(204).json();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
