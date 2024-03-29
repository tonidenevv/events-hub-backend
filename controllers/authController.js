const router = require('express').Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../config/multer')(process.env.AVATARS_BUCKET_NAME);

router.post('/register', upload.multer.single('file'), async (req, res) => {
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
            const blob = upload.bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on('finish', () => {
                const avatarUrl = process.env.AVATAR_BASE_URL + fileName;
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

                    res.status(201).json({ token, _id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, gender: user.gender });
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

            res.status(201).json({ token, _id: user._id, username: user.username, email: user.email, gender: user.gender });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
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

            res.status(200).json({ token, _id: existingUser._id, gender: existingUser.gender, username: existingUser.username, avatarUrl: existingUser.avatarUrl, email: existingUser.email });
        } else {
            const token = jwt.sign({
                username: existingUser.username,
                email: existingUser.email,
                gender: existingUser.gender,
                _id: existingUser._id,
            }, process.env.JWT_SECRET_KEY);

            res.status(200).json({ token, _id: existingUser._id, gender: existingUser.gender, username: existingUser.username, email: existingUser.email });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/logout', authMiddleware, (req, res) => {
    res.status(200).json('Logged out');
});

router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const checkWrongPasswordLength = (password) => {
            if (password.length < 5 || password.length > 15) return true;

            return false;
        }

        if (checkWrongPasswordLength(newPassword)) return res.status(400).json({ message: 'Password should be between 5 and 15 characters.' });

        if (newPassword !== confirmNewPassword) return res.status(400).json({ message: 'Passwords don\'t match.' });

        if (checkWrongPasswordLength(currentPassword)) return res.status(401).json({ message: 'Wrong password.' });

        const user = await User.findById(req.user._id);

        const isCorrectPassword = await bcrypt.compare(currentPassword, user.password);

        if (!isCorrectPassword) return res.status(401).json({ message: 'Wrong password.' });

        const newHashedPassword = await bcrypt.hash(newPassword, 11);

        user.password = newHashedPassword;

        await user.save();
        res.status(200).json('Success');
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;