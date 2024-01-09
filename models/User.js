const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        match: /^[a-zA-Z0-9_-]{5,15}$/,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        minlength: 5,
        maxlength: 25,
        required: true,
    },
    gender: {
        required: true,
        enum: ['male', 'female'],
    },
    avatarUrl: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    attending: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Event',
    }],
});

module.exports = mongoose.model('User', userSchema);