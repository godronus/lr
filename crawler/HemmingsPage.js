const puppeteer = require('puppeteer');
const PuppeteerScraper = require('./PuppeteerScraper');

const thisYear = new Date().getFullYear();
const URL = `https://www.hemmings.com/classifieds/?adtypeFacet=Vehicles for Sale&seller_typeFacet[]=Private Seller&seller_typeFacet[]=Dealer&year_min=1900&year_max=${thisYear - 30}&has_imagesFacet=true&has_priceFacet=true`;
const PAGE_SIZE = 60;
let totalNumberItems = 0;
const pagesPerBrowserWindow = 3;


const classifiedPage = () => {
  // console.log('​classifiedPage -> totalNumberItems', totalNumberItems);
  // const elem = document.getElementsByClassName('results-count');
  // console.log('elem', elem);
  // console.log('elem', elem.length);
  // // if (!totalNumberItems) {
  // }
  const cars = [];
  const carElems = document.querySelectorAll('div.web-result');
  carElems.forEach((webResult) => {
    const carJson = {};
    carJson.heading = webResult.querySelector('a.rs-headline > h3').innerText;
    cars.push(carJson);
  });
  return cars;
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
  let data = [];
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
        await page.goto(providedUrls[urlIndex], { timeout: 50000 });
        console.log('Page loaded ... Lets evaluate');
        data = data.concat(await page.evaluate(classifiedPage));
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

const crawlAll = () => {
  // This will keep using a new proxy for each iteration until all pages are collected.
  // Each proxy iteration calls pageCrawler() - which in turn collects from multiple urls.
  totalNumberItems = 850;

  let pageExists = true;
  let startIndex = 0;
  let data = [];

  // const urls = [];
  // const lastPageIndex = startIndex + (3 * PAGE_SIZE)
  // for (let i = startIndex; i < lastPageIndex; i += PAGE_SIZE) {
  //   urls.push(`${URL}&page_size=${PAGE_SIZE}&start=${i}`);
  // }

  // console.log('​scrapeAll -> pageUrl', urls);
  // PuppeteerScraper.tryScraping(urls, pageCrawler).then(data => console.log('tryScraping -> data : ', data));





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
      console.log('​crawlNextBrowserWindow -> resultData', resultData);
      if (resultData && resultData.length) {
        startIndex += (pagesPerBrowserWindow * PAGE_SIZE);
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