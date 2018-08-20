const ClassicCars = require('../crawlers/ClassicCars');

const ScraperController = {

  getClassicCarData: async (req, res, next) => {
    try {
      const fetchedData = await ClassicCars.getData();
      if (!req.body.automated) res.status(200).send(fetchedData);
      res.locals.fetchedData = fetchedData;
      next();
    }
    catch (error) {
      if (!req.body.automated) res.status(400).end(error);
      next(error);
    }
  },
};

module.exports = ScraperController;