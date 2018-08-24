const Car = require('../dbModels/CarModel');
const utils = require('../utils');
const config = require('../config');

const priceToNumber = (price) => {
  if (price[0] === '$') {
    return parseInt(price.replace('$', '').replace(',', ''), 10);
  }
  return -1;
};

const getCarInfo = (heading) => {
  const headingArr = heading.split(' ');
  const year = headingArr.splice(0, 1)[0];
  const make = headingArr.splice(0, 1)[0];
  return {
    year,
    make,
    model: headingArr.join(' '),
  };
};

const updateDb = (fetchedCar, calcEuPrice) => new Promise((resolve, reject) => {
  const resolveError = (err, msg, car) => {
    resolve({
      error: msg,
      exception: err,
      car,
    });
  };
  Car.findOne({ identifier: fetchedCar.identifier}, (err, foundCar) => {
    if (err) {
      resolveError(err, 'Error: Car not Found:', fetchedCar);
      return;
    }
    if (foundCar) {
      // Car exists -> update stillAvailable field
      foundCar.stillAvailable = fetchedCar.stillAvailable;
      if (config.calcEurDaily) {
        foundCar.euPrice = calcEuPrice(fetchedCar.price);
      }
      foundCar.save((err, savedCar) => {
        if (err) {
          resolveError(err, 'Error: Car not Saved:', savedCar);
          return;
        }
        resolve({ success: true, car: savedCar });
      });
    } else {
      // New Car -> add it to the database
      Car.create(fetchedCar, (err, newCar) => {
        if (err) {
          resolveError(err, 'Error: New Car failed:', newCar);
          return;
        }
        resolve({ success: true, car: newCar });
      });
    }
  });
});

const getPriceCalculator = (req) => {
  const rate = req.locals.euRate;
  return (price) => {
    let usPrice = (typeof price === 'string') ? priceToNumber(price) : price;
    if (usPrice === -1) return -1;
// Will add all logice here to add on Fees and shipping etc..
// Need this info from Louis Rouaze
    usPrice += config.usdFee;
    let euPrice = parseInt(usPrice * rate, 10);
    euPrice = Math.ceil(euPrice / 5) * 5; //rounds up to nearest 5
    euPrice += config.eurFee;
    return euPrice;
  };
}

const addCars = (req, res, next) => {
  const calcEuPrice = getPriceCalculator(req);
  const carsArr = req.locals.fetchedData;
  const fetchedCars = carsArr.map((car) => {
    const carInfo = getCarInfo(car.heading);
    return {
      source: car.source,
      identifier: car.identifier,
      heading: car.heading,
      model: carInfo.model,
      make: carInfo.make,
      year: parseInt(carInfo.year, 10),
      seller: car.seller,
      location: car.location,
      shortDescription: car.shortDescription,
      thumbImage: car.thumbImage,
      price: priceToNumber(car.price),
      euPrice: calcEuPrice(car.price),
      stillAvailable: car.stillAvailable,
      carAdded: car.carAdded,
    };
  });
  Promise.all(fetchedCars.map((fetchedCar) => updateDb(fetchedCar, calcEuPrice)))
    .then((results) => {
      const errors = results.filter((resolvedObj) => !resolvedObj.success);
      if (!errors.length) {
        res.locals.dbUpdate = { success: 'All Cars updated in database Succesfully' };
      } else {
        res.locals.errors = errors;
      }
      next();
    })
    .catch((error) => {
      /* updateDb always resolves - can just contain Obj.error */
      res.locals.errors = error;
      next(error);
    });
};

const removeOld = (req, res, next) => {
  let threeMonthsOld = utils.monthsAgoDate(3);
  Car.deleteMany({ stillAvailable: { $lt: threeMonthsOld } }, (err, result) => {
    if (err) {
      res.locals.errors = err;
    } else {
      res.locals.removedOld = { success: 'Removed all old / sold cars' };
    }
    next();
  });
};

const findCars = (req, res, next) => {
  const { searchCriteria } = req.body;
  const query = {
    year: {  $gt: searchCriteria.fromDate, $lt: searchCriteria.toDate },
  };
  if (searchCriteria.searchPhrase.length) {
    query.heading = { "$regex": searchCriteria.searchPhrase, "$options": "i" };
  }
  if (searchCriteria.make.length) {
    query.make = { "$regex": searchCriteria.make, "$options": "i" };
  }
  if (searchCriteria.model.length) {
    query.model = { "$regex": searchCriteria.model, "$options": "i" };
  }

  const skip = searchCriteria.pageNum;
  let limit = searchCriteria.pageNum + searchCriteria.pageSize;

  Car.find(query, (err, results) => {
// console.log('​findCars -> query', query);
    if (err) {
      console.log('Error: Unable to findCars... CarController.findCars()');
      return;
    }
    res.locals.totalItems = results.length;
// console.log('​findCars -> results.length', results.length);
    res.locals.cars = results.slice(skip, limit);
    if (results.length < searchCriteria.pageSize) {
      // fill page with results from nearby years +- 5yrs
      // keep expanding till you have enough OR
      // fill with different model??
      // then make??
    }
    next();
  });
};

const retrieveSearchCriteria = (query) => {
  const searchCriteria = {};
  searchCriteria.searchPhrase = query.sP ? query.sP : '';
  searchCriteria.pageNum = query.pg ? parseInt(query.pg, 10) : 0;
  searchCriteria.pageSize = query.pz ? parseInt(query.pz, 10) : 15;
  searchCriteria.fromDate = query.dtF ? parseInt(query.dtF, 10) : 1890;
  searchCriteria.toDate = query.dtT ? parseInt(query.dtT, 10) : utils.getVintageYr();
  searchCriteria.make = query.mk ? query.mk : '';
  searchCriteria.model = query.md ? query.md : '';
  return searchCriteria;
};

const CarController = {
  addCars,
  removeOld,
  findCars,
  retrieveSearchCriteria,
};

module.exports = CarController;