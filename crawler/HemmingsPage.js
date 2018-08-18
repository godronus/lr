const puppeteer = require('puppeteer');
const PuppeteerScraper = require('./PuppeteerScraper');
const CarController = require('../Controllers/CarController');

const thisYear = new Date().getFullYear();
const URL = `https://www.hemmings.com/classifieds/?adtypeFacet=Vehicles for Sale&seller_typeFacet[]=Private Seller&seller_typeFacet[]=Dealer&year_min=1900&year_max=${thisYear - 30}`;
const PAGE_SIZE = 60;
let totalNumberItems = 0;
const pagesPerBrowserWindow = 1; // SHOULD BE 3

const classifiedPage = () => {
  // Variables and Console Logs are pushed to Puppeteer Environment - Not This local Environment
  const retObj = {
    count: document.getElementsByClassName('results-count')[0].innerText,
    cars: [],
  };

  const getValue = (webResult, selector, value) => {
    const element = webResult.querySelector(selector);
    if (element && element[value]) {
      return webResult.querySelector(selector)[value];
    }
    return false;
  };

  // Each Car Element -->
  const carElems = document.querySelectorAll('div.web-result');
  carElems.forEach((webResult) => {
    const carJson = {};
    carJson.identifier = getValue(webResult, 'a.rs-headline', 'href');
    carJson.heading = getValue(webResult, 'a.rs-headline > h3', 'innerText');
    carJson.price = getValue(webResult, 'div.pull-right > h3.class_price', 'innerText');
    carJson.image = getValue(webResult, 'div > div.rs-img-container > a', 'href');
    carJson.location = getValue(webResult, 'div.result-text > h4', 'innerText');
    carJson.descriptionShort = getValue(webResult, 'div.result-text > div.classified_description > p', 'innerText');
    carJson.seller = getValue(webResult, 'div.result-text > div > a', 'innerText'); // if Private Seller - will just show up as 'false'
    retObj.cars.push(carJson);
    // $('div.web-result')[0].querySelector('div > div.rs-img-container')
  });
  return retObj;
};


const createBrowser = (proxyOptions) => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch(proxyOptions);
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 926 });
      resolve({
        browser,
        page,
      });
    } catch (exception) {
      console.log('Issue with Puppeteer Browser..', exception);
      reject({
        page: false,
        error: 'Issue with Puppeteer Browser..',
      });
    }
  });
}

const crawlAllPageUrls = (pBrowser, providedUrls) => {
  const { page, browser } = pBrowser;
  let data = {
    count: 0,
    cars: [],
  };
  return new Promise(async (resolve, reject) => {
    if (!page) {
      console.log('crawlAllPageUrls -> Error with Browser page');
      await browser.close();
      return reject();
    }
    const evalPage = async (urlIndex = 0) => {

      if (urlIndex === providedUrls.length) {
        await browser.close();
        return resolve(data);
      }
      try {
        console.log('pageCrawler -> goto Page', providedUrls[urlIndex]);
        await page.goto(providedUrls[urlIndex], { timeout: 60000 });
        // await page.goto(providedUrls[urlIndex], { timeout: 0, waitUntil: 'domcontentloaded' });
        console.log('Page loaded ... Lets evaluate');
        const pageData = await page.evaluate(classifiedPage);
        data.count = pageData.count;
        data.cars = data.cars.concat(pageData.cars);
      }
      catch (exception) {
        console.log('<< Page Load Reject : >>', exception);
        console.log('ERROR! Proxy slow or blocked');
        await browser.close();
        return reject();
      }
      evalPage(urlIndex + 1);
    };
    evalPage();
  });
};

const pageCrawler = async (providedUrls, proxyOptions) => {
  // This opens a new Puppeteer window and then cycles through all providedUrls. (uses const pagesPerBrowserWindow)
  // Collects data from each and returns a Promise containing all the data in an array.
  let pB = await createBrowser(proxyOptions);
  return crawlAllPageUrls(pB, providedUrls);
};

const getTotalNumberOfItems = (countString) => {
  // This comes in form of: Viewing 1 - 60 of 18,255 results
  const countArr = countString.replace(',', '').split(' ');
  return parseInt(countArr[countArr.length - 2], 10);
};

const crawlAll = () => {
  // This will keep using a new proxy for each iteration until all pages are collected.
  // Each proxy iteration calls pageCrawler() - which in turn collects from multiple urls.
  totalNumberItems = 0; // Should reset for each new crawl
  let startIndex = 0;

  const crawlNextBrowserWindow = async () => {
    if (startIndex  > totalNumberItems) {
      console.log('Start Index OUT OF BOUNDS');
      return;
    }
    const urls = [];

    const lastPageIndex = startIndex + (pagesPerBrowserWindow * PAGE_SIZE);
    for (let i = startIndex; i < lastPageIndex; i += PAGE_SIZE) {
      urls.push(`${URL}&page_size=${PAGE_SIZE}&start=${i}`);
    }
    let resultData;
    try {
      resultData = await PuppeteerScraper.tryScraping(urls, pageCrawler);
      if (resultData) {
        if (totalNumberItems === 0 && resultData.count) {
          totalNumberItems = getTotalNumberOfItems(resultData.count);
          // only use a size without going beyond fractions on last page of results
          totalNumberItems -= (totalNumberItems % PAGE_SIZE);
// JUST FOR TESTING - ONE PAGE
totalNumberItems = 40;
        }

        if (resultData && resultData.cars.length) {

          console.log('​crawlNextBrowserWindow -> resultData.cars', resultData.cars);
          CarController.addCars(resultData.cars);
          /*
                AT THIS POINT IT HAS DATA - SHOULD ADD TO DB. ONLY IF NEW VEHICLES SHOULD IT CONTINUE.
          */
          startIndex += (pagesPerBrowserWindow * PAGE_SIZE);
        } else {
          console.log('LOOK AT ERRR');
        }
      }
    } catch (error) {
      console.log('catch -> error', error);
    } finally {
      if (resultData !== 'MAX_ATTEMPTS') {
        crawlNextBrowserWindow();
      }
    }
  };
  crawlNextBrowserWindow();
};

const HemmingsPage = {
  pageCrawler,
  crawlAll,
};

module.exports = HemmingsPage;