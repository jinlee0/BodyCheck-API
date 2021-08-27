const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isLoggedIn, getValidationError, getNoSuchResource, getSuccess, getFailure, checkClient } = require('./middlewares');
const { User, Token } = require('../models');

const router = express.Router();

router.post('/join', checkClient, async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (exUser) {
            return res.json(getFailure('alread exists'));
        }
        const hash = await bcrypt.hash(password, 12);
        await User.create({
            email,
            password: hash,
        });

        const user = await User.findOne({
            where: {email}, 
            attributes: {exclude: ['password']},
        });

        const refreshToken = jwt.sign({
        }, process.env.JWT_SECRET, {
            issuer: 'sota',
        });

        const token = await Token.create({
            UserId: user.id,
            refreshToken,
        })

        return res.status(201).json(getSuccess(user));
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/login', checkClient,
    async (req, res, next) => {
        const { email, password } = req.body;
        const params = { email, password };
        const validationError = getValidationError(params);

        if (validationError) {
            return res.status(400).json(validationError);
        }
        else {
            next();
        }

    },
    async (req, res, next) => {
        try {

            const { email, password } = req.body;

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.json(getFailure('${email} does not exist'));
            }

            const result = await bcrypt.compare(password, user.password);
            if (!result) {
                return res.json(getFailure('email and password do not match'));
            }

            const exp = Date.now() + 1000 * 60 * 60;
            const token = jwt.sign({
                id: user.id,
                email: user.email,
            }, process.env.JWT_SECRET, {
                expiresIn: '1h',
                issuer: 'sota',
            });

            const refreshToken = await Token.findOne({
                where: {UserId: user.id},
            })

            return res.status(200).json(getSuccess({token, exp, refreshToken: refreshToken.refreshToken}));
        } catch (error) {
            console.error(error);
            return next(error);
        }
    });

router.get('/me', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ 
            where: { id: req.decoded.id },
            attributes: {exclude: ['password']},
        });
        if (!user) {
            return res.status(400).json(getNoSuchResource('user', `id=${req.decoded.id}`));
        }
        return res.status(200).json(getSuccess(user));
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.post('/refresh', isLoggedIn, async (req, res, next) => {
    try {
        const {refreshToken} = req.body;
        const {id} = req.decoded;
        const user = await User.findOne({
            where: {id},
            include: {model: Token, limit: 1},
        });
        if(refreshToken !== user.Tokens[0].refreshToken){
            return res.status(400).json(getFailure('wrong refreshToken'));
        }

        const exp = Date.now() + 1000 * 60 * 60;
        const token = jwt.sign({
            id: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, {
            expiresIn: '1h',
            issuer: 'sota',
        });
        return res.status(200).json(getSuccess({token, exp}));
    } catch (error) {
        console.error(error);
        return next(error);
    }
});


module.exports = router;
