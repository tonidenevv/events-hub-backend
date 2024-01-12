const router = require('express').Router();
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');

router.use('/auth', authController);
router.use('/users', userController);

module.exports = router;