const cheerio = require('cheerio');
const request = require('request');
const utils = require('../utils');
const config = require('../config');
const BASE_URL = `https://classiccars.com/listings/find/1900-${utils.getVintageYr()}?ps=60&s=datelisted`;

const getPageData = (url, todaysDate) => new Promise((resolve, reject) => {
  request(url, (error, response, html) => {
    if (error || response.statusCode !== 200) reject({ error: 'classiccars.com not responding...' });
    const $ = cheerio.load(html);
    const retObj = [];
    const rows = $('.search-result-item > div.row');
    rows.each((i, rowDiv) => {
      const carObj = {
        source: 'https://classiccars.com',
        stillAvailable: todaysDate,
        carAdded: todaysDate,
      };
      carObj.thumbImage = $(rowDiv).find('div > span.img-cell > a > img.img-placement').attr('src');
      if (carObj.thumbImage.indexOf('listing-default-thumb.jpg') != -1) {
        carObj.thumbImage = '/images/no-image.png';
      }
      const contentDiv = $(rowDiv).find('div > div.item-detail-content');
      carObj.identifier = $(contentDiv).find('div.item-name-container > a').attr('href');
      carObj.heading = $(contentDiv).find('div.item-name-container > a > h3').text();
      let desc = $(contentDiv).find('div.item-desc').text();
      carObj.shortDescription = desc.slice(0, desc.indexOf('Read More')).trim();
      if ((!carObj.shortDescription.length) || (carObj.shortDescription === 'N/A')) {
        carObj.shortDescription = config.defaultShortDescription;
      }
      carObj.price = $(contentDiv).find('div > div > div.price-box > span.item-price').text();
      retObj.push(carObj);
    });
    resolve(retObj);
  });
});

const getAllUrls = () => new Promise((resolve, reject) => {
  request(BASE_URL, (error, response, html) => {
    if (error || response.statusCode !== 200) reject({ error: 'classiccars.com not responding...' });
    const $ = cheerio.load(html);
    const searchResultsTextArr = $('span.search-result-info').text().trim().split(' ');
    if (searchResultsTextArr.length < 9) reject({ error: 'unable to collect page number data' });
    const numPages = searchResultsTextArr[5].replace(/[^\d]/g, '');
    const urlsArr = [];
    for (let i = 1; i <= numPages; i += 1) {
      urlsArr.push(`${BASE_URL}&p=${i}`);
    }
    resolve(urlsArr);
  });
});

const fetchAllPages = (allUrls) => new Promise((resolve, reject) => {
  if (!allUrls.length) reject({error: 'No urls found to fetch'});

// testing - just fetch 1 page1, randomly from fist 5 - START
  const randomIndex = Math.floor((Math.random() * 5) + 1);
  allUrls = [allUrls[0]];
  console.log('​fetchAllPages -> allUrls >>>>>>>>>>>>>>>>>>>>>>>>>', allUrls);
// testing - END

  const todaysDate = new Date();
  let fetchedData = [];
  const fetchNextPage = async (remainingUrls) => {
    if (remainingUrls.length === 0) resolve(fetchedData);
    try {
      const nextPageUrl = remainingUrls.shift();
      const nextPageData = await getPageData(nextPageUrl, todaysDate);
      fetchedData = fetchedData.concat(nextPageData);
      await utils.sleepRdm();
      fetchNextPage(remainingUrls);
    }
    catch(error) {
      reject(error);
    }
  };
  fetchNextPage(allUrls);
});

const getData = () => new Promise(async (resolve, reject) => {
  try {
    const allUrls = await getAllUrls();
    const retData = await fetchAllPages(allUrls);
    resolve(retData);
  }
  catch (error) {
    reject(error);
  }
});

const ClassicCars = {
  getData,
};

module.exports = ClassicCars;
