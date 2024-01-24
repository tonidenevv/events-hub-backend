const router = require('express').Router();
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const eventController = require('./controllers/eventController');
const commentController = require('./controllers/commentController');

router.use('/auth', authController);
router.use('/users', userController);
router.use('/events', eventController);
router.use('/comments', commentController);

module.exports = router;