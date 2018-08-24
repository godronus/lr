
const sleepTimer = (seconds) => new Promise((resolve, reject) => {
  if (!seconds || seconds > 30 || isNaN(parseInt(seconds)))
    reject({error: 'sleep needs seconds provided as a Number <= 20'})
  setTimeout(resolve, seconds * 1000);
});

const utils = {
  sleep(seconds) {
    return sleepTimer(seconds);
  },

  sleepRdm() {
    ///////////////////////////// TESTING ////////////////////////////
    // return sleep(Math.floor((Math.random() * 30) + 3));
    // Should be using a longer sleep pattern when fetching them all.. Save slamming website
    return sleepTimer(Math.floor((Math.random() * 3) + 1));
  ///////////////////////////// TESTING ////////////////////////////
  },

  monthsAgoDate(numMonths) {
    const dt = new Date();
    if (dt.getMonth() >= numMonths) {
      return dt.setMonth(dt.getMonth() - numMonths);
    } else {
      const month = 11 - Math.abs(dt.getMonth() - numMonths);
      return dt.setFullYear(dt.getFullYear() - 1).setMonth(month);
    }
  },

  getVintageYr() {
    const thisYear = new Date().getFullYear();
    return thisYear - 30;
  },
};



module.exports = utils;