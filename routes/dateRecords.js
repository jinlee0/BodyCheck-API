const express = require("express");
const multer = require("multer");
const { isLoggedIn, getSuccess, getFailure, updateForEach } = require("./middlewares");
const { File, DateRecord, Record, User } = require("../models");
const router = express.Router();

// Read
router.get("/", isLoggedIn, async (req, res, next) => {
  try {
    // query options: date
    const {date, UserId} = req.query;
    
    let where = {};

    if(date){
      if(date === ''){
        return res.status(400).json(getFailure(req.originalUrl + ' date cant be blank'));
      }
      where.date = date;
    }
    if(UserId){
      const user = await User.findByPk(UserId);
      if(!user){
        return res.status(404).json(getFailure(req.originalUrl + ' UserId'));
      }
      where.UserId = UserId;
    }

    const dateRecords = await DateRecord.findAll({where});
    if(dateRecords.length === 0){
      return res.status(204).json();
    }
    return res.status(200).json(getSuccess(dateRecords));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/:id', isLoggedIn, async (req, res, next) => {
  try {
    const {id} = req.params;
    
    const dateRecord = await DateRecord.findByPk(id);
    if(!dateRecord){
      return res.status(404).json(getFailure(req.originalUrl + ' id'));
    }

    return res.status(200).json(getSuccess(dateRecord));
  } catch (error) {
    console.error(error);
    next(error);
  }
})

// Create
router.post("/", isLoggedIn, async (req, res, next) => {
  try{
    const {date,startTime,endTime,memo,UserId} = req.body;

    const user = await User.findByPk(UserId);
    if(!user){
      return res.status(404).json(getFailure(req.originalUrl + ' UserId'));
    }

    if(!date){
      return res.status(400).json(getFailure(req.originalUrl+'Date is not nullable'));
    }

    const record = await DateRecord.create({
      date,
      startTime,
      endTime,
      memo,
      UserId,
    });
    if(!record){
      return res.status(500).json(getFailure(`db error: create`));
    }
    return res.status(201).json(getSuccess(record));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Update
router.patch("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const {date,startTime,endTime,memo,UserId} = req.body;
    const {id} = req.params;

    if(date===undefined && startTime===undefined && endTime===undefined && memo===undefined && UserId===undefined){
      return res.status(400).json(getFailure(req.originalUrl+ ' At least one content required'));
    }

    if(date===null || UserId === null){
      return res.status(400).json(getFailure(req.originalUrl + ' Date and UserId are not nullable'));
    }

    const dateRecord = await DateRecord.findByPk(id);
    if(!dateRecord){
      return res.status(404).json(getFailure(req.originalUrl + ' id'));
    }

    const isSame = await updateForEach(dateRecord, {date, startTime, endTime, memo, UserId});
    if(isSame){
      return res.status(204).json();
    }

    return res.status(201).json(getSuccess(dateRecord));

  } catch (error) {
    console.error(error);
    next(error);
  }
});

// Delete
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const { id } = req.params;

    const dateRecord = await DateRecord.findByPk(id);
    if(!dateRecord){
      return res.status(404).json(req.originalUrl + ' id');
    }
    await dateRecord.destroy();
    return res.status(204).json();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
