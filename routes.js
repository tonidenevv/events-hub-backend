const router = require('express').Router();
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const eventController = require('./controllers/eventController');

router.use('/auth', authController);
router.use('/users', userController);
router.use('/events', eventController);

module.exports = router;