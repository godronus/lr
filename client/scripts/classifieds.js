$(document).ready(function() {

  const fetchCars = async (searchCriteria) => {
    try {
      const results = await fetch('/classifieds/search', {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ searchCriteria }),
      });
      const searchResultObj = await results.json();
      const resultList = $('#result-list');
      classifiedsObj.searchResultObj = searchResultObj;
      classifiedsObj.initPageDefaults();
      searchResultObj.cars.forEach((car) => resultList.append(createAdvert(car)));

    }
    catch (error) {
      // Need to handle this error somehow..
      console.error('Error:', error);
    }
  };
  fetchCars(searchCriteria);
});
