const router = require('express').Router();

router.post('/login', (req, res) => {
    res.send('Login!');
});

router.post('/register', (req, res) => {
    console.log(req.body);
    res.status(200).json({ message: 'HEllo' });
});

module.exports = router;