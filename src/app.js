const express = require('express');
const path = require('path');
const cors = require('cors');
const usersRouter = require('./routers/users');
const websiteRouter = require('./routers/dynamicWebsite');
require('./db/mongoose');

const app = express();

app.use(cors());

app.set('views', path.join(__dirname));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(usersRouter);
app.use(websiteRouter);

module.exports = app;
