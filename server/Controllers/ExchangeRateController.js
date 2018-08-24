const fetch = require('node-fetch');

const API = 'http://apilayer.net/api/live';
const apiKey = '?access_key=fa38d8fcb9a0f6c12ac5c6a760451630';

const ExchangeRateController = {
  getUsToEuRate: (req, res, next) => {
    if (!req.locals) req.locals = {};
    const apiUrl = `${API}${apiKey}&source=USD&currencies=EUR`;
    // fetch(apiUrl)
    //   .then(res => res.json())
    //   .then((currency) => {
    //     console.log('​getUsToEuRate -> res', currency.quotes.USDEUR);
    //     req.locals.euRate = currency.quotes.USDEUR;
    //     next();
    //   })
    //   .catch((error) => {
    //     res.locals.errors = error;
    //     next(error);
    //   });
    req.locals.euRate = 0.866;
    next();
  },
};

module.exports = ExchangeRateController;