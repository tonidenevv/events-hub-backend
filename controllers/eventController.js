const router = require('express').Router()
const Event = require('../models/Event');
const authMiddleware = require('../middlewares/authMiddleware');
require('dotenv').config();
const upload = require('../config/multer')(process.env.EVENT_IMAGES_BUCKET_NAME);
const uniqid = require('uniqid');
const { default: mongoose } = require('mongoose');

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

        if (!mongoose.isValidObjectId(eventId)) return res.status(400).json({ message: 'Invalid ID' });

        const event = await Event.findById(eventId);

        if (!event) return res.status(400).json({ message: 'Wrong ID' });

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

module.exports = router;