const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const scraperController = require('./Controllers/ScraperController');
const carController = require('./Controllers/CarController');
const exchangeRateController = require('./Controllers/ExchangeRateController');
const config = require('./config');
const utils = require('./utils');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../client'))); //serves scripts folder
app.use(express.static(path.join(__dirname, '../assets'))); //serves assets folder

app.set('view engine', 'ejs');

// Database
mongoose.connect('mongodb://test1:testuser1@ds125872.mlab.com:25872/lr-testing', { useNewUrlParser: true });
mongoose.connection.once('open', () => {
  console.log('Connected to Database');
});

app.get('/', (req, res, next) => {
  res.render('pages/index', {
    title: config.webName,
  });
});

app.get('/services', (req, res, next) => {
  res.render('pages/services', {
    title: config.webName,
  });
});

app.get('/classifieds', (req, res, next) => {
  const searchCriteria = carController.retrieveSearchCriteria(req.query);
  res.render('pages/classifieds', {
    title: config.webName,
    searchCriteria: JSON.stringify(searchCriteria),
  });
});

app.post('/classifieds/search',
  carController.findCars,
  (req, res, next) => {
    res.status(200).send(res.locals);
  },
);

// TESTING ROUTES - These should be called on interval - This allows forcing a fetch
app.get('/scrapeClassicCars',
  scraperController.getClassicCarData,
  exchangeRateController.getUsToEuRate,
  carController.addCars,
  carController.removeOld,
  (req, res, next) => {
    res.status(200).send(res.locals);
  },
);

app.listen(3000);

console.log('Listening on Port 3000');

module.exports = app;