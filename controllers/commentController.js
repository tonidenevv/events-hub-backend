const router = require('express').Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/authMiddleware');
const Comment = require('../models/Comment');
const Event = require('../models/Event');

// NOT OWNER MIDDLEWARE
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { commentText, eventId } = req.body;

        if (!mongoose.isValidObjectId(eventId)) return res.status(404).json({ message: 'Event ID invalid.' });

        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        const comment = new Comment({ commentText, _ownerId: req.user._id, _eventId: eventId });

        event.comments.push(comment._id);

        Promise.all([comment.save(), event.save()]).then(responses => {
            res.status(201).json(responses[0]);
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

// router.get('/', async (req, res) => {

// });

module.exports = router;