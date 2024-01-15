const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 20,
    },
    description: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 25,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    ticketPrice: {
        type: Number,
        required: true,
        min: 1,
        max: 9999,
    },
    _ownerId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User',
    },
    attending: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
});

module.exports = mongoose.model('Event', eventSchema);