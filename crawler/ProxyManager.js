const ProxyFinder = require('public-proxy-finder');

const removeOldProxies = (list) => {
  // Filter out any proxies that haven't been checked for over 30 minutes
  return list.filter((proxy) => proxy['Last Checked'] < 60 * 30 * 1000);
};

const getProxyServer = (() => {
  let proxiesList = [];
  let lastProxyIndex = 1;

  const nextProxy = () => {
    // return next Proxy from the list
    lastProxyIndex += 1;
    if (lastProxyIndex >= proxiesList.length-2) lastProxyIndex = 1;
    const proxy = proxiesList[lastProxyIndex];
    console.log('Try different location... proxy: ');
    console.log(proxy);
    return `${proxy['IP Address']}:${proxy.Port}`;
  };

  return () => {
    return new Promise((resolve, reject) => {
      if (proxiesList.length) proxiesList = removeOldProxies(proxiesList);
      if (proxiesList.length < 20) {
        ProxyFinder.ssl()
          .then((newProxies) => {
            proxiesList = newProxies;
            if (proxiesList.length < 3) {
              reject('Found no available proxies');
            }
            resolve(nextProxy());
          });
      } else {
        resolve(nextProxy());
      }
    });
  };
})();

const ProxyManager = {
  getProxyServer,
};

module.exports = ProxyManager;
