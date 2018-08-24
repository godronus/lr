$(document).ready(function() {

// console.log('searchCriteria', searchCriteria);
// Initialise Page
  $(`.pg-${searchCriteria.pageSize}`).addClass('underline');

  const initPageDefaults = () => {
    if (classifiedsObj.searchResultObj && classifiedsObj.searchResultObj.totalItems) {
      $('.pg-item-start').text(parseInt(searchCriteria.pageNum, 10) + 1);
      let lastItem = parseInt(searchCriteria.pageNum, 10) + parseInt(searchCriteria.pageSize, 10);
      $('.pg-item-end').text(Math.min(classifiedsObj.searchResultObj.totalItems, lastItem));
      $('.pg-item-total').text(classifiedsObj.searchResultObj.totalItems);
    }
  };
  classifiedsObj.initPageDefaults = initPageDefaults;

// Functions
  const reloadPage = (newCriteria) => {
    window.location = classifiedSearchUrl(newCriteria);
  };

// Event Handlers
  $('.pg-next').click(() => {
    if (searchCriteria.pageNum + searchCriteria.pageSize < classifiedsObj.searchResultObj.totalItems) {
      const newCriteria = Object.assign({}, searchCriteria);
      newCriteria.pageNum = searchCriteria.pageNum + searchCriteria.pageSize;
      reloadPage(newCriteria);
    }
  });

  $('.pg-prev').click(() => {
    if (searchCriteria.pageNum > 0) {
      const newCriteria = Object.assign({}, searchCriteria);
      newCriteria.pageNum = Math.max(searchCriteria.pageNum - searchCriteria.pageSize, 0);
      reloadPage(newCriteria);
    }
  });

  const changePageSize = (newPageSize) => {
    const newCriteria = Object.assign({}, searchCriteria);
    newCriteria.pageSize = newPageSize;
    reloadPage(newCriteria);
  };

  $('.pg-15').click(() => changePageSize(15));
  $('.pg-30').click(() => changePageSize(30));
  $('.pg-60').click(() => changePageSize(60));
});