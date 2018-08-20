const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const scraperController = require('./Controllers/ScraperController');
const carController = require('./Controllers/CarController');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// const scraperController = require('./scraper');

mongoose.connect('mongodb://test1:testuser1@ds125872.mlab.com:25872/lr-testing');

mongoose.connection.once('open', () => {
  console.log('Connected to Database');
});

// TESTING ROUTES - These should be called on interval - This allows forcing a fetch
app.get('/scrapeClassicCars',
  scraperController.getClassicCarData,
  carController.addCars,
  (req, res, next) => {
    res.status(200).end();
  },
);

app.listen(3000);

console.log('Listening on Port 3000');

module.exports = app;