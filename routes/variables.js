const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError, updateForEach } = require('./middlewares');
const { Variable, VariableType, Record, Exercise } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn, 
    async (req, res, next) => {
        // req {name, VariableTypeId, ExersizeId}
        const { name, VariableTypeId, ExerciseId } = req.body;
        const params = { name, VariableTypeId, ExerciseId};
        const validationError = getValidationError(params);
        if (validationError) {
            return res.status(400).json(validationError);
        }
        else {
            next();
        }
},
    async (req, res, next) => {
        const { name, VariableTypeId, ExerciseId } = req.body;

        const exVariableType = await VariableType.findOne({where: {id:VariableTypeId}});
        if(!exVariableType){
            const variableTypes = await VariableType.findAll();
            let retStr = '';
            for(let i = 0; i < variableTypes.length; i++){
                retStr += `{ ${variableTypes[i].id}: ${variableTypes[i].name} } `;
            }   
            return res.status(404).json(getFailure(`${req.originalUrl}
                VariableType: You must use one of the following list`+retStr));
        }

        const variable = await Variable.create({
            name,
            VariableTypeId,
            ExerciseId,
        });
        if(!variable){
            return res.status(500).json(getFailure(`db error: create`));
        }

        return res.status(201).json(getSuccess(variable));
});

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        // query options : { ExerciseId, withRecords }
        // if (ExerciseId) { return Variables where ExerciseId=ExerciseId } else { return all Variables } 
        // if (withRecords) { return Variables with Records }
        const { ExerciseId, withRecords } = req.query;
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
        if (ExerciseId) { // 
            const exercise = await Exercise.findByPk(ExerciseId);
            if(!exercise){
                return res.status(404).json(getFailure(req.originalUrl + ' ExerciseId'));
            }
            where.ExerciseId = ExerciseId;
        }

        let include = [];
        if(withRecords){
            include = [{model: Record}];
        }

        let options = {};
        options.where = where;
        if(include.length !== 0){
            options.include = include;
        } 

        const variables = await Variable.findAll(options);
        if(variables.length === 0){
            return res.status(204).json();
        }

        return res.status(200).json(getSuccess(variables));

    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/types', isLoggedIn, async (req, res, next) => {
    try {
        const variableTypes = await VariableType.findAll();
        if(variableTypes.length === 0){
            return res.status(204).json();
        }

        return res.status(200).json(getSuccess(variableTypes));
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

        const variable = await Variable.findOne({ where: { id }, paranoid });
        if (!variable) {
            return res.status(404).json(getFailure(req.originalUrl));
        }

        return res.status(200).json(getSuccess(variable));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, VariableTypeId } = req.body;

        const variable = await Variable.findOne({ where: { id } });
        if (!variable) {
            return res.status(404).json(getFailure(req.originalUrl));
        }

        if(VariableTypeId === null){
            return res.status(400).json(getFailure(req.originalUrl + ' VarialbeTypeId is not nullable'))
        }

        // 하나라도 없으면 400 Bad request
        if(name===undefined && VariableTypeId===undefined){
            return res.status(400).json(getFailure(`${req.originalUrl} At least one content is required`));
        }

        // 기존 데이터과 같다면 204 No Contents

        if(VariableTypeId){ // req.query에 VariableTypeId가 있을 경우 값이 db에 존재하는지 확인 후 업데이트
            const exVariableType = await VariableType.findOne({where: {id:VariableTypeId}});
            if(!exVariableType){
                const variableTypes = await VariableType.findAll();
                let retStr = '';
                for(let i = 0; i < variableTypes.length; i++){
                    retStr += ` { ${variableTypes[i].id}: ${variableTypes[i].name} }`;
                }
                return res.status(404).json(getFailure(`${req.originalUrl} VariableType: You must use one of the following list`+retStr));
            }
        }

        const isSame = await updateForEach(variable, {name, VariableTypeId});
        if(isSame){
            return res.status(204).json();
        }
        

        return res.status(201).json(getSuccess(variable));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        let { force } = req.query;
        force = getTrueFalse(force);
        
        const variable = await Variable.findOne({ where: { id }, paranoid: !force });
        if (!variable) {
            return res.status(404).json(getFailure(`there is no vairable where id=${id}`));
        }

        await variable.destroy({force});

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;