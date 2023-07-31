const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const middleware = require('./utils/middleware');

// middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(middleware.requestLogger);

app.use('/api/users', userRoutes);

module.exports = app;