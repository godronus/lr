const HemmingsPage = require('../crawler/HemmingsPage');

const CarController = {

  getData(req, res, next) {
    HemmingsPage.crawlAll();
    next();
  },

};

module.exports = CarController;