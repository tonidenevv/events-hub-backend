const router = require('express').Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();
const upload = require('../config/multer')(process.env.AVATARS_BUCKET_NAME);
const jwt = require('jsonwebtoken');
const uniqid = require('uniqid');

router.get('/', (req, res) => {
    res.send('Users');
});

router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        if (userId !== req.user._id) return res.status(401).json({ message: 'Unauthorized' });
        const user = await User.findById(userId);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
    }
});

router.delete('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        if (userId !== req.user._id) return res.status(401).json({ message: 'Unauthorized' });
        await User.findByIdAndDelete(userId);
        res.status(200).json('Success');
    } catch (err) {
        console.log(err);
    }
});

router.put('/:userId', authMiddleware, upload.multer.single('file'), async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId !== req.user._id) return res.status(401).json({ message: 'Unauthorized' });

        if (req.body.username) {
            const takenUsernameUser = await User.findOne({ username: req.body.username });
            if (takenUsernameUser) return res.status(409).json({ message: 'Username is already taken.' });
        }

        if (req.body.email) {
            const takenEmailUser = await User.findOne({ email: req.body.email });
            if (takenEmailUser) return res.status(409).json({ message: 'Email is already taken.' });
        }

        const user = await User.findById(userId);

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        if (req.file) {
            const fileName = `${uniqid()}_avatar.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`;
            const blob = upload.bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on('finish', () => {
                const avatarUrl = process.env.IMAGE_BASE_URL + fileName;
                user.avatarUrl = avatarUrl;
                user.save().then(() => {
                    const token = jwt.sign({
                        username: user.username,
                        email: user.email,
                        gender: user.gender,
                        _id: user._id,
                        avatarUrl: user.avatarUrl
                    }, process.env.JWT_SECRET_KEY);

                    res.status(200).json({ token, _id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
                });
            });
            blobStream.end(req.file.buffer);
        } else {
            await user.save();
            if (!user.avatarUrl) {
                const token = jwt.sign({
                    username: user.username,
                    email: user.email,
                    gender: user.gender,
                    _id: user._id,
                }, process.env.JWT_SECRET_KEY);

                res.status(200).json({ token, _id: user._id, username: user.username, email: user.email });
            } else {
                const token = jwt.sign({
                    username: user.username,
                    email: user.email,
                    gender: user.gender,
                    _id: user._id,
                    avatarUrl: user.avatarUrl,
                }, process.env.JWT_SECRET_KEY);

                res.status(200).json({ token, _id: user._id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
            }
        }
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;