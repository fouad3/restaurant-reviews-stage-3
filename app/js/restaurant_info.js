let restaurant;
var newMap;

window.addEventListener('offline', (event) => {
    window.siiimpleToast.alert('No Internet Connection!');
});

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
let initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiZm91YWQtYXNocmFmIiwiYSI6ImNqazE0dm1iNjA3eGszcnQ0dDNlN3k3bnAifQ.uKTfhCxs1NtirqEcRaAZwg',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};
 

/**
 * Get current restaurant from page URL.
 */
let fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      // clear old restaurant data
      resetRestaurant();
      fillRestaurantHTML(id);
      callback(null, restaurant)
    });
  }
};


/**
 * Create restaurant HTML and add it to the webpage
 */
let fillRestaurantHTML = (id, restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  const imageUrl = DBHelper.imageUrlForRestaurant(restaurant);
  const imageUrlName  = imageUrl;
  const imageType = 'webp';
  image.src = `${imageUrlName}-800_2x.${imageType}`;
  image.setAttribute('srcset', `${imageUrlName}-800_2x.${imageType} 800w, ${imageUrlName}-400_1x.${imageType} 400w`);
  image.setAttribute('alt',`${restaurant.name} Restaurant`);
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  DBHelper.fetchReviews(id, (error, reviews) => {
      if (error) { // Got an error!
          console.error(error);
      } else {
          // clear old reviews data
          resetReviews();
          // fill reviews
          fillReviewsHTML(reviews);
      }
  });
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
let fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
let fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.setAttribute('id', 'reviewsTitle');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
let createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.createdAt).toLocaleString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
let fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
let getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};


/**
 * remove the old restaurant data
 */
let resetRestaurant= () => {
    // remove restaurant map data
    if(self.newMap) {
        self.newMap.remove();
    }

    // remove restaurant breadcrumb and create Home only in breadcrumb
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';

    // clear restaurant breadcrumb and create Home only in breadcrumb
    const li = document.createElement('li');
    li.innerHTML = `<a href='/'>Home</a>`;
    breadcrumb.appendChild(li);


    // clear restaurant hours data
    const hoursTable = document.getElementById('restaurant-hours');
    if(hoursTable){
        hoursTable.innerHTML = '';
    }
};


let resetReviews= () => {
    // remove reviews title
    const reviewsTitle = document.getElementById('reviewsTitle');
    if(reviewsTitle){
        reviewsTitle.remove();
    }

    // remove reviews list data
    const reviewsList = document.getElementById('reviews-list');
    if(reviewsList.innerHTML) {
        reviewsList.innerHTML = '';
    }
};

let addReview = () => {
  const name = document.getElementById('reviewer-name').value;
  const rating = document.getElementById('rating-select').value;
  const comment = document.getElementById('reviewer-comment').value;
  const ul = document.getElementById('reviews-list');
  if(name && comment) {
      event.preventDefault();
      let review = {
          name: name,
          createdAt: new Date().getTime(),
          rating: rating,
          comments: comment
      };
      ul.insertBefore(createReviewHTML(review), ul.childNodes[0]);
      review.restaurantId =  self.restaurant.id;
      DBHelper.addReview(review);
      document.getElementById("review-form").reset();
  }
};