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
    date: {
        type: Date,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
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