const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError } = require('./middlewares');
const { Variable, VariableType, Record } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn, 
    async (req, res, next) => {
        // req {name, VariableTypeId, ExersizeId}
        const { name, VariableTypeId, ExerciseId } = req.body;
        const params = { name, VariableTypeId, ExerciseId };
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
            return res.status(404).json(getFailure(`[POST] /variables
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
                return res.status(404).json(getFailure(`data not found, [GET] /variables?ExerciseId=${ExerciseId}`));
            }
        } else {
            variables = await Variable.findAll();
            if (variables.length === 0) {
                return res.status(404).json(getFailure(`data not found, [GET] /variables`));
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
            return res.status(404).json(getFailure(`data not found, [GET] /variables/${id}`));
        }

        return res.status(200).json(getSuccess(variable));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.put('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, VariableTypeId } = req.query;

        const variable = await Variable.findOne({ where: { id } });
        if (!variable) {
            return res.status(404).json(getFailure(`data not found, [PUT] /variables/${id}`));
        }
        if(!name && !VariableTypeId){
            return res.status(400).json(getFailure(`[PUT] /variables/${id}?name=${name}&VariableTypeId=${VariableTypeId}, At least one content is required`));
        }

        if(VariableTypeId){ // req.query에 VariableTypeId가 있을 경우 값이 db에 존재하는지 확인 후 업데이트
            const exVariableType = await VariableType.findOne({where: {id:VariableTypeId}});
            if(!exVariableType){
                const variableTypes = await VariableType.findAll();
                let retStr = '';
                for(let i = 0; i < variableTypes.length; i++){
                    retStr += ` { ${variableTypes[i].id}: ${variableTypes[i].name} }`;
                }
                return res.status(404).json(getFailure(`[PUT] /variables/${id}?name=${name}&VariableTypeId=${VariableTypeId}, VariableType: You must use one of the following list`+retStr));
            }
            variable.update({VariableTypeId});
        }

        if(name){
            variable.update({ name });
        }

        return res.json(getSuccess(variable));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const variable = await Variable.findOne({ where: { id } });
        let ret = getSuccess(variable);
        ret.affectedRows = 0;
        if (!variable) {
            return res.json({ ret });
        }

        ret.affectedRows = await Variable.destroy({ where: { id } });

        return res.json({ ret });
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;