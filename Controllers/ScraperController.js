const HemmingsPage = require('../crawler/HemmingsPage');
const ClassicCars = require('../crawler/ClassicCars');

const CarController = {

  getData(req, res, next) {
    // HemmingsPage.crawlAll();
    // next();
    ClassicCars.displayDataJSON(req, res, next);
  },

};

module.exports = CarController;