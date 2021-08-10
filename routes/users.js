const express = require('express');
const { isLoggedIn, getSuccess, getFailure, getValidationError } = require('./middlewares');
const { User, Variable, VariableType, Record } = require('../models');
const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        // query options : paranoid, email
        // if (paranoid) return {User with {deletedAt} include deleted records}

        let {paranoid, email} = req.query;

        if(paranoid){
            if(paranoid === 'true' || paranoid === '1'){
                paranoid = true;
            } else if (paranoid === 'false' || paranoid === '0'){
                paranoid = false;
            }
        }

        if(email){
            const user = await User.findOne({
                where: {email},
                attributes: {exclude: ['password']},
                paranoid,
            });
            if(!user){
                return res.status(404).json(getFailure(req.originalUrl));
            }
            return res.status(200).json(getSuccess(user));
        }

        const users = await User.findAll({
            attributes: {exclude: ['password']},
            paranoid,
        })

        return res.status(200).json(getSuccess(users));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        // query options : paranoid
        // if (paranoid) return {User with {deletedAt} include deleted records}

        const {id} = req.params;
        let { paranoid } = req.query;
        if(paranoid){
            if(paranoid === 'true' || paranoid === '1'){
                paranoid = true;
            } else if (paranoid === 'false' || paranoid === '0'){
                paranoid = false;
            }
        }
        const user = await User.findOne({
            where: {id},
            attributes: {exclude:['password']},
            paranoid,
        });
        if(!user){
            return res.status(404).json(getFailure(req.originalUrl));
        }

        return res.status(200).json(getSuccess(user));

    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        // params: id
        // query: email
        const {id} = req.params;
        const {email} = req.query;
        if(!email){
            return res.status(400).json(getFailure(req.originalUrl));
        }

        const user = await User.findOne({
            where: {id},
            attributes: {exclude: ['password']},
        });
        if(!user){
            return res.status(404).json(getFailure(req.originalUrl));
        }

        // 바꿀 게 없으면
        if(email == user.getDataValue('email')){
            return res.status(204).json();
        }

        const exUser = await User.findOne({
            where: {email},
            paranoid: false,
        });
        console.log(exUser);
        if(exUser){
            return res.status(400).json(req.originalUrl + ' The email already exists. Email must be unique');
        }

        await user.update({email});

        return res.status(201).json(getSuccess(user));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const user = await User.findOne({ 
            where: { id },
            attributes: {exclude: ['password']},
        });
        if (!user) {
            return res.status(404).json(getFailure(req.originalUrl));
        }

        await user.destroy();

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})

module.exports = router;