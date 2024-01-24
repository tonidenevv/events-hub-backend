const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    commentText: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
    },
    _ownerId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'User',
    },
    _eventId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref: 'Event',
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    likes: [{
        type: mongoose.SchemaTypes.ObjectId,
    }]
});

module.exports = mongoose.model('Comment', commentSchema);