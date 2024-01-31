const express = require('express');
const cors = require('cors');
const routes = require('../routes');

module.exports = (app) => {
    app.use(cors({ origin: 'https://events-hub-frontend.vercel.app/' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(routes);

    app.listen(process.env.PORT, () => console.log(`Server is listening on port ${process.env.PORT}...`));
};