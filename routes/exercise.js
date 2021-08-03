const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Exercise, Variable, VariableType } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        const user = req.user;
        // type이 유효한 값인지 확인
        for(let i = 0; i < req.body.variables.length; i++){
            if(await VariableType.findOne({
                where:{
                    id:req.body.variables[i].type,
                },
            })){
                continue;
            }else{
                return res.json({
                    error : `no type ${req.body.variables[i].type}`,
                    cause : req.body.variables[i],
                });
            }
        }
        
        const exercise = await Exercise.create({
            name: req.body.name,
            UserId: user.id,
        });
        if(!exercise){
            return res.json({
                error : `exercise create failed`,
                cause : req.body.name,
            });
        }

        const variables = new Array();
        for(let i = 0; i < req.body.variables.length; i++){
            const variable = await Variable.create({
                name: req.body.variables[i].name,
                ExerciseId: exercise.id,
                VariableTypeId: req.body.variables[i].type,
            });
            if(!variable){
                console.log('variable error: need to delete exercise');
                // 앞서 생성한 exercise 레코드 삭제
                // 에러 응답
                return res.json({
                    error: 'variable create failed',
                    cause: req.body.variables[i],
                })
            }
            variables[i] = {
                name: variable.name,
                type: variable.type,
            };
        }
        res.json({name : exercise.name, variables}); // 성공시 이름만 전달 
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