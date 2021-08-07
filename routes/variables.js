const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError } = require('./middlewares');
const { Exercise, Variable, VariableType } = require('../models');
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
        const variable = await Variable.findOne({ where: { id } });
        if (!variable) {
            return res.status(404).json(getFailure(`data not found, [PUT] /variables/${id}`));
        }
        const { name, VariableTypeId } = req.query;
        if(!name && !VariableTypeId){
            return res.status(400).json(getFailure(`[PUT] /variables/${id}?name=${name}&VariableTypeId=${VariableTypeId}, At least one content is required`));
        }

        if(VariableTypeId){ // req.query에 VariableTypeId가 있을 경우 값이 db에 존재하는지 확인 후 업데이트
            const exVariableType = await VariableType.findOne({where: {id:VariableTypeId}});
            if(!exVariableType){
                const variableTypes = await VariableType.findAll();
                let retStr = '';
                for(let i = 0; i < variableTypes.length; i++){
                    retStr += `{ ${variableTypes[i].id}: ${variableTypes[i].name} } `;
                }
                return res.status(404).json(getFailure(`[PUT] /variables/${id}?name=${name}&VariableTypeId=${VariableTypeId},
                VariableType: You must use one of the following list`+retStr));
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