const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError } = require('./middlewares');
const { Exercise, Variable, Record } = require('../models');
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
        // query options : { UserId, withVariables, withRecords }
        // if (UserId) { return Exercises where UserId=UserId } else { return all Exercises }
        // if (withVariables) { return Exercises with Variables }
        // if (withRecords) { return Exercises with Records }
        const { UserId, withVariables, withRecords } = req.query;
        let exercises;

        if (UserId) { // 
            exercises = await Exercise.findAll({
                where: {
                    UserId,
                },
            });
            if (exercises.length === 0) {
                return res.status(404).json(getFailure(req.originalUrl));
            }
        } else {
            exercises = await Exercise.findAll({});
            if (exercises.length === 0) {
                return res.status(404).json(getFailure(null));
            }
        }

        if(withVariables){
            for(let i = 0; i < exercises.length; i++){
                let variables = await Variable.findAll({where: {ExerciseId: exercises[i].id}});
                exercises[i].dataValues.variables = variables;
                if(withRecords){
                    for(let j = 0; j < variables.length; j++){
                        let records = await Record.findAll({where: {VariableId: variables[j].id}});
                        variables[j].dataValues.records = records;
                    }
                }
            }
        } else {
            if(withRecords){
                for(let i = 0; i < exercises.length; i++){
                    let variables = await Variable.findAll({where: {ExerciseId: exercises[i].id}});
                    exercises[i].dataValues.records = []; // variable이 없을 경우에도 일정한 포맷으로 반환하기 위해
                    for(let j = 0; j < variables.length; j++){
                        let records = await Record.findAll({where: {VariableId: variables[j].id}});
                        exercises[j].dataValues.records = records;
                    }
                }
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
            res.status(404).json(getFailure(req.originalUrl));
        }

        return res.status(200).json(getSuccess(exercise));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.query;

        const exercise = await Exercise.findOne({ where: { id } });
        if (!exercise) {
            return res.status(404).json(getFailure(req.originalUrl));
        }

        if(name == exercise.getDataValue('name')){
            return res.status(204).json();
        }
    
        await exercise.update({ name });

        return res.status(201).json(getSuccess(exercise));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        // Exercise를 delete하더라도 Record는 유지한다.
        // 유지되는 Record의 type을 해석하기 위해 Variable 또한 유지한다.
        const { id } = req.params;
        
        const exercise = await Exercise.findOne({ where: { id } });
        if (!exercise) {
            return res.status(404).json(req.originalUrl);
        }

        await exercise.destroy();

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})


module.exports = router;