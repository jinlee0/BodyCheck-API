const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationErro, getTrueFalse } = require('./middlewares');
const { Exercise, Variable, Record, User } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn,
    async (req, res, next) => {
        const { name, UserId } = req.body;
        const params = { name, UserId };
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
            const { name, UserId } = req.body;

            const user = await User.findOne({where: {id:UserId}});
            if(!user){
                return res.status(404).json(getFailure(req.originalUrl + ' UserId'));
            }

            const exercise = await Exercise.create({
                name,
                UserId,
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
        // query options : { UserId, withVariables, withRecords, paranoid }
        // if (UserId) { return Exercises where UserId=UserId } else { return all Exercises }
        // if (withVariables) { return Exercises with Variables }
        // if (withRecords) { return Exercises with Variables and Records }
        const { UserId, withVariables, withRecords } = req.query;
        let {paranoid} = req.query;

        if(paranoid){
            if(paranoid === 'true' || paranoid === '1'){
                paranoid = true;
            } else if (paranoid === 'false' || paranoid === '0'){
                paranoid = false;
            } else {
                return res.status(400).json(getFailure(req.originalUrl + ' paranoid: true/false/1/0'));
            }
        }

        let where = {};
        if (UserId) { // 
            const user = await User.findByPk(UserId);
            if(!user){
                return res.status(404).json(getFailure(req.originalUrl + ' UserId'));
            }
            where.UserId = UserId;
        }

        let includeObj = {};
        let include = [includeObj];
        if(withVariables || withRecords){
            includeObj.model = Variable;
            if(withRecords){
                includeObj.include = [{model: Record}];
            }
        }

        let options = {};
        options.where = where;
        options.paranoid = paranoid;
        if(includeObj.model){
            options.include = include;
        }

        const exercises = await Exercise.findAll(options);
        if(exercises.length === 0){
            return res.status(204).json();
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
        let {paranoid} = req.query;

        if(paranoid){
            if(paranoid === 'true' || paranoid === '1'){
                paranoid = true;
            } else if (paranoid === 'false' || paranoid === '0'){
                paranoid = false;
            } else {
                return res.status(400).json(getFailure(req.originalUrl + ' paranoid: true/false/1/0'));
            }
        }

        const exercise = await Exercise.findOne({ where: { id }, paranoid });

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
        const { name } = req.body;

        const exercise = await Exercise.findOne({ where: { id } });
        if (!exercise) {
            return res.status(404).json(getFailure(req.originalUrl));
        }

        if(name===null){
            return res.status(400).json(getFailure(req.originalUrl + ' name is not nullable'));
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
        let { force } = req.query;
        force = getTrueFalse(force);
        
        const exercise = await Exercise.findOne({ where: { id }, paranoid: !force });
        if (!exercise) {
            return res.status(404).json(req.originalUrl);
        }

        await exercise.destroy({force});

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})


module.exports = router;