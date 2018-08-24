const ClassicCars = require('../crawlers/ClassicCars');

const ScraperController = {

  getClassicCarData: async (req, res, next) => {
    try {
      const fetchedData = await ClassicCars.getData();
      if (!req.locals) req.locals = {};
      req.locals.fetchedData = fetchedData;
      next();
    }
    catch (error) {
      res.locals.errors = error;
      next(error);
    }
  },
};

module.exports = ScraperController;