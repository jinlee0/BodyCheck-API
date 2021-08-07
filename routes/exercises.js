const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError } = require('./middlewares');
const { Exercise, Variable, VariableType } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn,
    async (req, res, next) => {
        const { name } = req.body;
        const params = { name };
        const validationError = getValidationError(params);

        if (validationError) {
            return res.status(400).json(validationError);
        }
        else {
            next();
        }

    }
    , async (req, res, next) => {
        try {
            // req {name}

            const user = req.decoded;
            const { name } = req.body;

            const exercise = await Exercise.create({
                name,
                UserId: user.id,
            });
            if (!exercise) {
                return res.status(500).json(getFailure('db error'));
            }

            return res.status(201).json(getSuccess(exercise));
        } catch (err) {
            console.error(err);
            next(err);
        }
    });

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        // query(조건 여부에 따라)
        const { UserId } = req.query;
        let exercises;
        if (UserId) { // 
            exercises = await Exercise.findAll({
                where: {
                    UserId,
                },
            });
            if (!exercises) {
                return res.status(404).json(getFailure(`data not found, [GET] /exercises?UserId=${id}`));
            }
        } else {
            exercises = await Exercise.findAll();
            if (!exercises) {
                return res.status(404).json(getFailure(null));
            }
        }

        return res.status(200).json(getSuccess(exercises));

    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const exercise = await Exercise.findOne({ where: { id } });

        if (!exercise) {
            res.status(404).json(getFailure(`data not found, [GET] /exercises/${id}`));
        }

        return res.status(200).json(getSuccess(exercise));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.put('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.query;
        const exercise = await Exercise.findOne({ where: { id } });
        if (!exercise) {
            res.status(404).json(getFailure(`data not found, [PUT] /exercises/${id}`));
        }
        exercise.update({ name });

        return res.json(getSuccess(exercise));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const exercise = await Exercise.findOne({ where: { id } });
        let ret = getSuccess(exercise);
        ret.affectedRows = 0;
        if (!exercise) {
            return res.json({ ret });
        }
        ret.affectedRows = await Exercise.destroy({ where: { id } });
        return res.json({ ret });
    } catch (err) {
        console.error(err);
        next(err);
    }
})


module.exports = router;