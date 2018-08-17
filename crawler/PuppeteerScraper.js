const ProxyManager = require('./ProxyManager');


const tryScraping = async (urls, pageCrawler, attemptsMade = 0) => {
  if (attemptsMade > 4) {
    console.log('​tryScraping -> attemptsMade - MAXIMUM');
    // Should be returning a promise either way..
    return 'MAX_ATTEMPTS';
  }
  const proxyOptions = {
    headless: false,
    args: [
      `--proxy-server=0.0.0.0:8080`,
      `--ignore-certificate-errors`
    ]
  }
  console.log('<<< Try fetching proxies >>>');
  console.log(`Attempt ${attemptsMade + 1} to fetch Proxy List...`);
  try {
    const proxy = await ProxyManager.getProxyServer();
    proxyOptions.args[0] = `--proxy-server=${proxy}`;
    return pageCrawler(urls, proxyOptions);
  }
  catch (err) {
    console.log('... Error fetching proxt list : ', err);
    console.log('proxy: ', proxyOptions.args[0]);
    tryScraping(urls, pageCrawler, attemptsMade + 1);
  }
};

const PuppeteerScraper = {
  tryScraping,
};

module.exports = PuppeteerScraper;
