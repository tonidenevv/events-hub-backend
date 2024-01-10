const router = require('express').Router();
const User = require('../models/User');
require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024,
    },
});

const projectId = process.env.STORAGE_PROJECT_ID;
const keyFilename = process.env.STORAGE_FILE_NAME;

const storage = new Storage({
    projectId,
    keyFilename,
});

const bucket = storage.bucket(process.env.BUCKET_NAME);

router.post('/register', multer.single('file'), async (req, res) => {
    try {
        const existingUsername = await User.findOne({ username: req.body.username });
        if (existingUsername) return res.status(409).json({ message: 'Username is already taken.' });
        const existingEmail = await User.findOne({ email: req.body.email });
        if (existingEmail) return res.status(409).json({ message: 'Email is already taken.' });

        const hashedPassword = await bcrypt.hash(req.body.password, 11);
        const userData = {
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            gender: req.body.gender,
        };

        if (req.file) {
            const fileName = `${uniqid()}_avatar.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`;
            const blob = bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on('finish', () => {
                const avatarUrl = process.env.IMAGE_BASE_URL + fileName;
                userData.avatarUrl = avatarUrl;
                const user = new User(userData);
                user.save().then(() => {
                    const token = jwt.sign({
                        username: user.username,
                        email: user.email,
                        gender: user.gender,
                        _id: user._id,
                        avatarUrl: user.avatarUrl
                    }, process.env.JWT_SECRET_KEY);

                    res.status(201).json({ token, _id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
                });
            });
            blobStream.end(req.file.buffer);
        } else {
            const user = new User(userData);
            await user.save();
            const token = jwt.sign({
                username: user.username,
                email: user.email,
                gender: user.gender,
                _id: user._id,
            }, process.env.JWT_SECRET_KEY);

            res.status(201).json({ token, _id: user._id, username: user.username, email: user.email });
        }
    } catch (err) {
        console.log(err);
    }
});

router.post('/login', async (req, res) => {
    try {
        const message = 'Wrong username or password.';
        const existingUser = await User.findOne({ username: req.body.username });

        if (!existingUser) return res.status(401).json({ message });

        const isValidPassword = await bcrypt.compare(req.body.password, existingUser.password);

        if (!isValidPassword) return res.status(401).json({ message });

        if (existingUser.avatarUrl) {
            const token = jwt.sign({
                username: existingUser.username,
                email: existingUser.email,
                gender: existingUser.gender,
                _id: existingUser._id,
                avatarUrl: existingUser.avatarUrl,
            }, process.env.JWT_SECRET_KEY);

            res.status(200).json({ token, _id: existingUser._id, username: existingUser.username, avatarUrl: existingUser.avatarUrl, email: existingUser.email });
        } else {
            const token = jwt.sign({
                username: existingUser.username,
                email: existingUser.email,
                gender: existingUser.gender,
                _id: existingUser._id,
            }, process.env.JWT_SECRET_KEY);

            res.status(200).json({ token, _id: existingUser._id, username: existingUser.username, email: existingUser.email });
        }


    } catch (err) {
        console.log(err);
    }
});

module.exports = router;