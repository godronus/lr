const createAdvert = ((car) => {
  const imageContainer = (imgSrc) => {
    const imgWrapper = $('<div class="col-sm-4"></div>');
    const img = $(`<img src="${imgSrc}" class="img-fluid ad-content" alt="Car Picture">`);
    imgWrapper.append(img);
    return imgWrapper;
  };

  const detailsContainer = (heading, description, price, link) => {
    const detailsWrapper = $('<div class="col-sm-8 ad-content"></div>');
    const headingDiv = $(`<div class="h-25 ad-heading">${heading}</div>`);
    const descriptionDiv = $(`<div class="h-50">${description}</div>`);
    const priceContent = price === -1 ? 'Contact Seller' : `€ ${price}`;
    const priceDiv = $(`<div class="h-25 ad-price">${priceContent}</div>`);
    detailsWrapper.append(headingDiv);
    detailsWrapper.append(descriptionDiv);
    detailsWrapper.append(priceDiv);
    return detailsWrapper;
  }

  return (car) => {
    const row = $('<div class="row ad-row my-2 pb-2"></div>');
    row.append(imageContainer(car.thumbImage));
    row.append(detailsContainer(car.heading, car.shortDescription, car.euPrice, car.source + car.identifier));
    return row;
  }
})();

const classifiedSearchUrl = (criteria) => {
  console.log('​classifiedSearchUrl -> criteria', criteria);
  const criteriaMap = {
    searchPhrase: 'sP',
    pageNum: 'pg',
    pageSize: 'pz',
    fromDate: 'dtF',
    toDate: 'dtT',
    make: 'mk',
    model: 'md',
  };
  const addIfNeeded = (type) => {
    if (typeof criteria[type] === 'string') {
      if (!criteria[type].trim().length) {
        return '';
      }
    }
    return `${criteriaMap[type]}=${criteria[type]}&`;
  };
  let url = '/classifieds?';
  Object.keys(searchCriteria).forEach((criteria) => url += addIfNeeded(criteria));
  return url.substring(0, url.length - 1);
};
