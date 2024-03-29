const router = require('express').Router()
const Event = require('../models/Event');
const User = require('../models/User');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();
const upload = require('../config/multer')(process.env.EVENT_IMAGES_BUCKET_NAME);
const uniqid = require('uniqid');
const { default: mongoose } = require('mongoose');
const { differenceInCalendarDays } = require('date-fns');

router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        res.status(200).json(events);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) return res.status(404).json({ message: 'Invalid ID' });

        const event = await Event.findById(eventId).populate({ path: 'comments', populate: { path: '_ownerId', model: 'User', select: 'avatarUrl username gender' }, options: { sort: { creationDate: -1 } } });

        if (!event) return res.status(404).json({ message: 'Event not found' });

        return res.status(200).json(event);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/', authMiddleware, upload.multer.single('file'), async (req, res) => {
    try {
        const eventData = {
            title: req.body.title,
            description: req.body.description,
            eventDate: req.body.eventDate,
            eventType: req.body.eventType,
            ticketPrice: req.body.ticketPrice,
        };

        if (!req.file) return res.status(400).json({ message: 'Missing fields' });

        const fileName = `${uniqid()}_event_image.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`;
        const blob = upload.bucket.file(fileName);
        const blobStream = blob.createWriteStream();

        blobStream.on('finish', () => {
            const imageUrl = process.env.IMAGE_BASE_URL + fileName;
            eventData.imageUrl = imageUrl;
            const event = new Event({ ...eventData, _ownerId: req.user._id });
            event.save().then(() => {
                res.status(201).json(event);
            });
        });

        blobStream.end(req.file.buffer);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/:eventId/edit', authMiddleware, upload.multer.single('file'), async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) return res.status(404).json({ message: 'Invalid ID' });

        let event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event._ownerId.valueOf() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

        const eventData = {
            title: req.body.title,
            description: req.body.description,
            eventDate: req.body.eventDate,
            eventType: req.body.eventType,
            ticketPrice: req.body.ticketPrice,
        };

        if (req.file) {
            const fileName = `${uniqid()}_event_image.${req.file.originalname.split('.')[req.file.originalname.split('.').length - 1]}`;
            const blob = upload.bucket.file(fileName);
            const blobStream = blob.createWriteStream();

            blobStream.on('finish', () => {
                const imageUrl = process.env.IMAGE_BASE_URL + fileName;
                eventData.imageUrl = imageUrl;
                Event.findByIdAndUpdate(eventId, { ...eventData, _ownerId: req.user._id, attending: event.attending, createdAt: event.createdAt, comments: event.comments }, { runValidators: true, new: true })
                    .then(updatedEvent => {
                        res.status(200).json(updatedEvent);
                    })
            });

            blobStream.end(req.file.buffer);
        } else {
            const updatedEvent = await Event.findByIdAndUpdate(eventId, { ...eventData, imageUrl: event.imageUrl, _ownerId: req.user._id, attending: event.attending, createdAt: event.createdAt, comments: event.comments }, { runValidators: true, new: true });
            res.status(200).json(updatedEvent);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:eventId/delete', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) return res.status(404).json({ message: 'Invalid ID' });

        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Invalid ID' });

        if (event._ownerId.valueOf() !== req.user._id) return res.status(403).json({ message: 'Forbidden' });

        const deletedEvent = await Event.findByIdAndDelete(eventId);

        res.status(200).json(deletedEvent);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/:eventId/attend', authMiddleware, async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.isValidObjectId(eventId)) return res.status(404).json({ message: 'Invalid ID' });

        const event = await Event.findById(eventId);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (event._ownerId.valueOf() === req.user._id) return res.status(403).json({ message: 'Forbidden' });

        const hasPassed = differenceInCalendarDays(event.eventDate.toString(), Date.now()) < 0;

        if (hasPassed) return res.status(409).json({ message: 'Event passed' });

        const isAttending = event.attending.some(x => x.valueOf() === req.user._id);

        const user = await User.findById(req.user._id);

        if (isAttending) {
            event.attending = event.attending.filter(x => x.valueOf() !== req.user._id);
            user.attending = user.attending.filter(x => x.valueOf() !== eventId);
        } else {
            event.attending.push(req.user._id);
            user.attending.push(eventId);
        }

        Promise.all([event.save(), user.save()]).then(responses => {
            res.status(200).json(responses[0]);
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;