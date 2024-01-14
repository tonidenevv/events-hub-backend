const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
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
    creationDate: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Comment', commentSchema);