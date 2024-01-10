const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.headers.authorize;
    const message = 'Unauthorized';

    if (!token) return res.status(401).json({ message });

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message });

        req.user = decoded;

        next();
    })
}