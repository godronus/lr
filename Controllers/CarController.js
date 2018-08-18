const Car = require('../dbModels/CarModel');

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

const addCars = (carsArr) => {
  console.log('I am in ADD CARS... >>>>>>>>>>>>>>>>>>>>>>>>');
  const carObjects = carsArr.map((car) => {
    const carInfo = getCarInfo(car.heading);
    return {
      identifier: car.identifier,
      heading: car.heading,
      model: carInfo.model,
      make: carInfo.make,
      year: parseInt(carInfo.year, 10),
      seller: car.seller,
      location: car.location,
      price: priceToNumber(car.price),
    };
  });
  carObjects.forEach((car) => {
    Car.create(car, (err, newCar) => {
      if (err) {
        console.log('Error adding Car', newCar);
      }
      console.log('Car Added: ', newCar);
    });
  });
};

const CarController = {
  addCars,
};

module.exports = CarController;