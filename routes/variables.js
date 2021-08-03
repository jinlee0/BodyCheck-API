const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Exercise, Variable, VariableType } = require('../models');
const e = require('express');
const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        // req {name, type, ExersizeId}
        const {name, VariableTypeId, ExerciseId} = req.body;

        // req 검사
        const params = {name, VariableTypeId, ExerciseId};
        const paramValues = Object.values(params);
        const paramNames = Object.keys(params);
        for(let i = 0; i < paramNames.length; i++){
            if(!paramValues){
                return res.status(400).json({
                    message: `param ${paramNames[i]} is required`,
                    detail:{
                        location: 'body',
                        param: paramNames[i],
                        value: paramValues[i],
                        error: NoParam,
                    }
                })
            }
        }

        // type이 유효한 값인지 확인
        if(! await VariableType.findOne({
            where:{
                id:VariableTypeId,
            },
        })){
            return res.status(400).json({
                message : `there is no VariableType where VariableType=${VariableTypeId}`,
                detail: {
                    location: 'body',
                    param: 'VariableTypeId',
                    value: VariableTypeId,
                    error: 'NoSuchRecord',
                }
            });
        }
        // ExerciseId가 존재하는지 확인
        if(! await Exercise.findOne({
            where:{
                id:ExerciseId,
            },
        })){
            return res.status(400).json({
                message: `there is no Exercise where ExerciseId=${ExerciseId}`,
                detail: {
                    location: 'body',
                    param: 'ExerciseId',
                    value: ExerciseId,
                    error: 'NoSuchRecord',
                } 
            })
        }
        
        const variable = await Variable.create({
            name,
            ExerciseId,
            VariableTypeId,
        });
        
        if(!variable){
            return res.status(500).json({
                message: `create failed`,
            });
        }
        
        return res.status(201).json(variable); // 성공시 이름만 전달 
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.delete('/', isLoggedIn, async(req, res, next) => {
    try{

    } catch(err){
        console.error(err);
        next(err);
    }
})


module.exports = router;