const express = require('express');
require('dotenv').config();
const setupMongoose = require('./config/mongoose');
const setupExpress = require('./config/express');

const app = express();
setupMongoose();
setupExpress(app);
