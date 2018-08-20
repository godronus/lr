'use strict';

const cheerio = require('cheerio');
const request = require('request');
const BASE_URL = 'https://classiccars.com/listings/find/1900-1988?ps=60&s=datelisted';
// 'p=1....4'
const totalPages = 0;

const getData = (url) => new Promise((resolve, reject) => {
  request(url, (error, response, html) => {
    if (error || response.statusCode !== 200) reject({ error: 'classiccars.com not responding...' });
    const $ = cheerio.load(html);
    const retObj = [];
    const rows = $('.search-result-item > div.row');
    rows.each((i, rowDiv) => {
      const carObj = {};
      carObj.thumbImage = $(rowDiv).find('div > span.img-cell > a > img.img-placement').attr('src');
      const contentDiv = $(rowDiv).find('div > div.item-detail-content');
      carObj.identifier = $(contentDiv).find('div.item-name-container > a').attr('href');
      carObj.heading = $(contentDiv).find('div.item-name-container > a > h3').text();
      carObj.descriptionShort = $(contentDiv).find('div.item-desc').text();
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

// testing - just fetch 3 pages -

  allUrls = allUrls.slice(0, 3);
  let fetchedData = [];
  const fetchNextPage = async (remainingUrls) => {
    if (remainingUrls.length === 0) resolve(fetchedData);
    try {
      const nextPageUrl = remainingUrls.shift();
      const nextPageData = await getData(nextPageUrl);
      fetchedData = fetchedData.concat(nextPageData);
      console.log('​fetchNextPage -> fetchedData >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', fetchedData.length);
      await sleep(2);
      fetchNextPage(remainingUrls);
    }
    catch(error) {
      reject(error);
    }
  };
  fetchNextPage(allUrls);
});

const displayDataJSON = async (req, res, next) => {

  try {
    const allUrls = await getAllUrls();
    const retData = await fetchAllPages(allUrls);
    res.status(200).send(retData);
  }
  catch (error) {
    res.status(400).send(error);
    next();
  }
};

const ClassicCars = {
  getData,
  displayDataJSON,
};

module.exports = ClassicCars;
