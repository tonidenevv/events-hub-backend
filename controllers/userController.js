const router = require('express').Router();
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();

router.get('/', (req, res) => {
    res.send('Users');
});

router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;