const express = require("express");
const multer = require("multer");
const { isLoggedIn } = require("./middlewares");
const { File, DateRecord, Record } = require("../models");
const router = express.Router();
const upload = multer();

// Read
router.get("/read/:id", isLoggedIn, async (req, res, next) => {
  try {
    let record = await DateRecord.findAll({
      where: { name: req.params.id },
    });
    res.json(record);
  } catch (error) {
    console.error(error);
    next(error);
  }
}
);

// Create
router.post("/:id", isLoggedIn, async (req, res, next) => {
  try {
    let record = await DateRecord.create({
      date: req.body.date,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      memo: req.body.memo
    });
    res.json(record);
  } catch (error) {
    console.error(error);
  }
}
);

// Update
router.post("/update/:id", isLoggedIn, async (req, res, next) => {
  try {
    let record = await DateRecord.update({
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        memo: req.body.memo
      },
      { where: { id: req.params.id } }
    );
    res.json(record);
  } catch (error) {
    console.error(error);
    next(error);
  }
}
);

// Delete
router.delete("/delete/:id", isLoggedIn, async (req, res, next) => {
  try {
    let record = await DateRecord.destroy({
      where: { id: req.params.id },
    });
    res.json(record);
  } catch (err) {
    console.error(err);
    next(err);
  }
}
);

module.exports = router;
