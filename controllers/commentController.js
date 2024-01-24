const router = require('express').Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middlewares/authMiddleware');
const Comment = require('../models/Comment');
const Event = require('../models/Event');

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { commentText, eventId } = req.body;

        if (!mongoose.isValidObjectId(eventId)) return res.status(404).json({ message: 'Event ID invalid.' });

        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event._ownerId.valueOf() === req.user._id) return res.status(403).json({ message: 'Forbidden' });

        const comment = new Comment({ commentText, _ownerId: req.user._id, _eventId: eventId });

        event.comments.push(comment._id);

        await comment.populate('_ownerId');

        Promise.all([comment.save(), event.save()]).then(() => {
            res.status(201).json(comment);
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:commentId/like', authMiddleware, async (req, res) => {
    try {
        const { commentId } = req.params;

        if (!mongoose.isValidObjectId(commentId)) return res.status(404).json({ message: 'Comment ID invalid.' });

        const comment = await Comment.findById(commentId);

        if (!comment) return res.status(404).json({ message: 'Comment not found.' });

        if (comment._ownerId.valueOf() === req.user._id) return res.status(403).json({ message: 'Forbidden' });

        const hasLiked = comment.likes.some(x => x.valueOf() === req.user._id);

        if (!hasLiked) {
            comment.likes.push(req.user._id);
        } else {
            comment.likes = comment.likes.filter(x => x.valueOf() !== req.user._id);
        }

        await comment.populate('_ownerId');
        await comment.save();

        res.status(200).json(comment);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;