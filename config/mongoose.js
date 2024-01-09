require('dotenv').config();
const mongoose = require('mongoose');

module.exports = () => {
    mongoose.connect(process.env.CONNECTION_URL);

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', () => console.log('DB Connected'));
};