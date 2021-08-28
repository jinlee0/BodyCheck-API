const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError, updateForEach } = require('./middlewares');
const { Variable, Record, DateRecord, Diet } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn, 
    async (req, res, next) => {
        try {
            const { name, DateRecordId } = req.body;
            const params = { name, DateRecordId };
            const validationError = getValidationError(params);
            if (validationError) {
                return res.status(400).json(validationError);
            }
            else {
                next();
            }
        } catch (err) {
            console.error(err);
            next(err);
        }
},
    async (req, res, next) => {
        try {    
            const { name, meal, memo, DateRecordId } = req.body;

            const exDateRecord = await DateRecord.findByPk(DateRecordId);
            if(!exDateRecord){ 
                return res.status(404).json(getFailure(req.originalUrl + ' DateRecordId'));
            }

            const diet = await Diet.create({
                name, meal, memo, DateRecordId
            });
            if(!diet){
                return res.status(500).json(getFailure(`db error: create`));
            }

            return res.status(201).json(getSuccess(diet));
        } catch (err) {
            console.error(err);
            next(err);
        }
});

router.get('/', isLoggedIn, async (req, res, next) => { 
    try {
        // query options : { DateRecordId }
        let { DateRecordId } = req.query;
        let diets;
        let where = {};

        if(DateRecordId){
            const dateRecord = await DateRecord.findByPk(DateRecordId);
            if(!dateRecord){
            return res.status(404).json(getFailure(req.originalUrl + ' DateRecordId'));
            }
            where.DateRecordId = DateRecordId;
        }

        diets = await Diet.findAll({
            where,
        });
        
        if(diets.length === 0){
            return res.status(204).json();
        }

        return res.status(200).json(getSuccess(diets));

    } catch (err) {
        console.error(err);
        next(err);
    }
})


router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;

        const diet = await Diet.findByPk(id);
        if (!diet) {
            return res.status(404).json(getFailure(req.originalUrl + ' id'));
        }

        return res.status(200).json(getSuccess(diet));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, meal, memo, DateRecordId } = req.body;
        // name not null

        const diet = await Diet.findByPk(id);
        if (!diet) {
            return res.status(404).json(getFailure(req.originalUrl + ' id'));
        }

        if(name === null){
            return res.status(400).json(getFailure(req.originalUrl + "name can't be null"));
        }

        // 하나라도 없으면 400 Bad request
        if(name === undefined && meal === undefined && memo === undefined && DateRecordId === undefined){
            return res.status(400).json(getFailure(`${req.originalUrl} At least one content is required`));
        }

        if(DateRecordId){ // req.body에 VariableId가 있을 경우 값이 db에 존재하는지 확인 후 업데이트
            const exDateRecord = await DateRecord.findByPk(DateRecordId);
            if(!exDateRecord){
                return res.status(404).json(getFailure(req.originalUrl + ' DateRecordId'));
            }
        }

        const isSame = await updateForEach(diet, {name, meal, memo, DateRecordId});
        // 기존 데이터과 같다면 204 No Contents
        if(isSame){
            return res.status(204).json();
        }

        return res.status(201).json(getSuccess(diet));
    } catch (err) {
        console.error(err);
        next(err);
    }
})


router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const diet = await Diet.findByPk(id);
        if (!diet) {
            return res.status(404).json(getFailure(`there is no diet where id=${id}`));
        }

        await diet.destroy();

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;