const express = require('express');
const fs = require('fs');
const { isLoggedIn, getSuccess, getFailure, getValidationError, updateForEach } = require('./middlewares');
const { UserProfile, User } = require('../models');
const router = express.Router();

router.post('/', isLoggedIn, 
    async (req, res, next) => {
        const { UserId } = req.body;
        const params = { UserId };
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
            // body : {UserId}
            // body(option) : {nick, image, age, height, weight, text}
            const { UserId } = req.body;
            let {nick, image, age, height, weight, text} = req.body;

            const user = await User.findOne({where:{id:UserId}});
            if(!user){
                return res.status(404).json(getFailure(' UserId'));
            }

            const exUserProfile = await UserProfile.findOne({where:{UserId}});
            if(exUserProfile){
                return res.status(400).json(getFailure(' Already exists'));
            }

            if(text){
                if(text.length > 255){
                    return res.status(404).json(getFailure(' Text must be 255 or less'));
                }
            }

            if(!nick){
                nick = user.getDataValue('email');
            }

            const userProfile = await UserProfile.create({
                nick, image, age, height, weight, text, UserId,
            });
            if(!userProfile){
                return res.status(500).json(getFailure(' DB error'));
            }

            return res.status(201).json(getSuccess(userProfile));
        } catch (err) {
            console.error(err);
            next(err);
        }
});

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        // query options : { UserId }
        // if (UserId) { return UserProfile where UserId=UserId } else { return all UserProfiles } 
        const { UserId } = req.query;

        if(UserId){
            const user = await User.findOne({where:{id:UserId}});
            if(!user){
                return res.status(404).json(getFailure(' UserId'));
            }
            const userProfile = await UserProfile.findOne({where:{UserId}});
            if(!userProfile){
                return res.status(204).json();
            }
            return res.status(200).json(getSuccess(userProfile));
        }

        const userProfiles = await UserProfile.findAll();
        if(userProfiles.length==0){
            return res.status(204).json();
        }

        return res.status(200).json(getSuccess(userProfiles));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.get('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;

        const userProfile = await UserProfile.findOne({ where: { id } });
        if (!userProfile) {
            return res.status(404).json(getFailure(req.originalUrl + 'No UserProfile with id'));
        }

        return res.status(200).json(getSuccess(userProfile));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.patch('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nick, image, age, height, weight, text } = req.body;

        const userProfile = await UserProfile.findOne({where:{id}});
        if(!userProfile){
            return res.status(404).json(getFailure(req.originalUrl + ' No UserProfile with id'));
        }

        if(nick === null){
            return res.status(400).json(getFailure(req.originalUrl + ' nick is not nullable'));
        }

        if(text){
            if(typeof(text) === 'string'){
                if(text.length > 255){
                    return res.status(400).json(getFailure(req.originalUrl + ' Text must be 255 or less'));
                }
            } else {
                return res.status(400).json(getFailure(req.originalUrl + ' text'));
            }
        }
        
        if(!nick && !image && !age && !height && !weight && !text){
            return res.status(400).json(getFailure(req.originalUrl + ' No body'));
        }

        const isSame = await updateForEach(userProfile, {nick, image, age, height, weight, text});
        if(isSame){
            return res.status(204).json();
        }

        return res.status(201).json(getSuccess(userProfile));
    } catch (err) {
        console.error(err);
        next(err);
    }
})

router.delete('/:id', isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const userProfile = await UserProfile.findOne({ where: { id } });
        if (!userProfile) {
            return res.status(404).json(getFailure(req.originalUrl + ' No UserProfile with id'));
        }

        await userProfile.destroy();

        return res.status(204).json();
    } catch (err) {
        console.error(err);
        next(err);
    }
})

// file
router.post("/:id/image/upload", isLoggedIn, async (req, res, next) => {
    try {
        const UserProfileId = req.params.id;
        const { file} = req.body;
        const originalUrl = file.path;

        if(!UserProfileId){
        return res.status(400).json(getFailure(req.originalUrl + `UserProfileId=${UserProfileId}`));
        }

        let userProfile = await UserProfile.findOne({
        where: { id: UserProfileId },
        })
        if (!userProfile) {
        return res.status(404).json(getFailure(`does not found userProfile via id`));
        }

        userProfile = await userProfile.update({image: originalUrl});

        return res.status(201).json(getSuccess(userProfile));
    } catch (error) {
        console.error(error);
        next(error);
    }
});



router.delete(
    '/:id/image',  
    async function(req, res, next) {
    try {
    const {id} = req.params;

    const userProfile = await UserProfile.findByPk(id);
    if (!userProfile) {
        return res.status(404).json(getFailure(`does not found file via id`));
    }

    const url = userProfile.getDataValue('image');

    if(!fs.existsSync(url)){
        return res.status(500).json(getFailure('db에서 파일 경로를 찾았는데 실제 경로엔 없네요...'));
    }

    fs.unlinkSync(url, (err) => {
        console.error(err);
    })

    await UserProfile.update({image: null});

    return res.status(204).json();
    } catch(error) {
    console.error(error);
    next(error);
    }
});

module.exports = router;