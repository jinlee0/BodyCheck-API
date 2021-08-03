const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Exercise, Variable, VariableType } = require('../models');
const e = require('express');
const router = express.Router();

router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        // req {name}

        const user = req.user;
        const {name} = req.body;

        if(!name){
            return res.status(400).json({
                message: `param name is required`,
                detail:{
                    location: 'body',
                    param: 'name',
                    value: name,
                    error: NoParam,
                }
            })
        }

        const exercise = await Exercise.create({
            name: req.body.name,
            UserId: user.id,
        });
        if(!exercise){
            return res.status(500).json({
                message: `create failed`,
            });
        }
        
        return res.status(201).json(exercise); // 성공시 이름만 전달 
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