const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError } = require('./middlewares');
const { Variable, VariableType, Record } = require('../models');
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
        let variables;

        if (ExerciseId) { // 
            variables = await Variable.findAll({
                where: {
                    ExerciseId,
                },
            });
            if (variables.length === 0) {
                return res.status(404).json(getFailure(req.originalUrl));
            }
        } else {
            variables = await Variable.findAll();
            if (variables.length === 0) {
                return res.status(404).json(getFailure(req.originalUrl));
            }
        }

        if(withRecords){
            for(let i = 0; i < variables.length; i++){
                const records = await Record.findAll({where: {VariableId: variables[i].id}});
                variables[i].setDataValue('records', records);
            }
        }

        return res.status(200).json(getSuccess(variables));

    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;

        const variable = await Variable.findOne({ where: { id } });
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
        const { name, VariableTypeId } = req.query;

        const variable = await Variable.findOne({ where: { id } });
        if (!variable) {
            return res.status(404).json(getFailure(req.originalUrl));
        }

        // 하나라도 없으면 400 Bad request
        if(!name && !VariableTypeId){
            return res.status(400).json(getFailure(`${req.originalUrl} At least one content is required`));
        }

        // 기존 데이터과 같다면 204 No Contents
        let obj = {
            id: variable.getDataValue('id'),
            name: (name) ? name : variable.getDataValue('name'),
            ExerciseId: variable.getDataValue('ExerciseId'),
            VariableTypeId: (VariableTypeId) ? VariableTypeId*1 : variable.getDataValue('VariableTypeId'),
        }
        if(JSON.stringify(obj) == JSON.stringify(variable.dataValues)){
            return res.status(204).json();
        }

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
            await variable.update({VariableTypeId});
        }

        if(name){
            await variable.update({ name });
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
        
        const variable = await Variable.findOne({ where: { id } });
        if (!variable) {
            return res.status(404).json(getFailure(`there is no vairable where id=${id}`));
        }

        await variable.destroy();

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;