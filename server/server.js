const express = require('express');
const app = express();
const mongoose = require('mongoose');
const scraperController = require('../Controllers/ScraperController');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// const scraperController = require('./scraper');

mongoose.connect('mongodb://test1:testuser1@ds125872.mlab.com:25872/lr-testing');

mongoose.connection.once('open', () => {
  console.log('Connected to Database');
});

// // first sample route
app.get('/scrape',
  scraperController.getData,
  (req, res, next) => {
    res.status(200).end();
  }
);

app.listen(3000);

console.log('Listening on Port 3000');

module.exports = app;