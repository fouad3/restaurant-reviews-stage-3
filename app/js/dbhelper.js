/**
 * Common database helper functions.
 */

class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
      const port = 1337;
      return `http://localhost:${port}/`;
  }

  static openIdb() {
      return idb.open('db', 2, function (upgradeDb) {
          switch (upgradeDb.oldVersion) {
              case 0:
                  upgradeDb.createObjectStore('restaurants-store', {
                      keyPath: 'id'
                  });
              case 1:
                  let reviewsStore = upgradeDb.createObjectStore('reviews-store', {
                      keyPath: 'id'
                  });
                  reviewsStore.createIndex('by-restaurant', 'restaurant_id');
          }
      });

  }

  static getCachedRestaurants() {
      return DBHelper.openIdb().then((db) => {
          if (!db) return;
          const restaurantsStore = db.transaction('restaurants-store').objectStore('restaurants-store');
          return restaurantsStore.getAll();
          });
  }


  static getCachedReviews(id) {
    return DBHelper.openIdb().then((db) => {
        if (!db) return;
        const reviewsStore = db.transaction('reviews-store').objectStore('reviews-store');
        const restaurantReviews = reviewsStore.index('by-restaurant');
        return restaurantReviews.getAll(id);
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // get data from idb if there are data
    DBHelper.getCachedRestaurants().then((restaurants) => {
        if(restaurants.length > 0) {
            return callback(null, restaurants);
        }
    });

    // fetch data from the network and update the idb
    fetch(DBHelper.DATABASE_URL+'restaurants').then((response) => {
      return response.json();
      }).then((restaurants) => {
          DBHelper.openIdb().then((db) => {
              if (!db) return;
              let tx = db.transaction('restaurants-store', 'readwrite');
              let restaurantStore = tx.objectStore('restaurants-store');
              restaurants.forEach((restaurant)=> {
                  restaurantStore.put(restaurant);
              });
          });
        return callback(null,restaurants);
    }).catch((err) => {
        return callback(err , null);
    });
  }


    /**
     * Fetch restaurant reviews.
     */
  static fetchReviews(id, callback) {
    // get data from idb if there are data
    DBHelper.getCachedReviews(id).then((reviews) => {
        if(reviews.length > 0) {
            return callback(null, reviews.reverse());
        }
    });

    // fetch data from the network and update the idb
    fetch(DBHelper.DATABASE_URL+'reviews/?restaurant_id='+id).then((response) => {
        return response.json();
    }).then((reviews) => {
        DBHelper.openIdb().then((db) => {
            if (!db) return;
            let tx = db.transaction('reviews-store', 'readwrite');
            let store = tx.objectStore('reviews-store');
            reviews.forEach((review)=> {
                store.put(review);
            });
        });
        return callback(null,reviews.reverse());
    }).catch((err) => {
        return callback(err , null);
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant

          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      });
      marker.addTo(newMap);
    return marker;
  }



  static changeFavoriteStateForRestaurant(id, isFavorite, callback) {
      fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${isFavorite}`, {
          method: 'PUT'
      }).then((res) => {
          DBHelper.openIdb()
              .then((db) => {
                  let tx = db.transaction('restaurants-store', 'readwrite');
                  let restaurantsStore = tx.objectStore('restaurants-store');
                  restaurantsStore.get(id)
                      .then((restaurant) => {
                          restaurant.is_favorite = isFavorite;
                          restaurantsStore.put(restaurant);
                      });

              });
          callback(null, "favorite status updated successfully");
      })
          .catch((err) => {
              callback("failed to update favorite status", null);
          })
  }

  static addReview(review){

     if (!navigator.onLine) {
          DBHelper.sendWhenOnline(review);
          return;
     }
     let reviewParameters = {
        "restaurant_id": parseInt(review.restaurantId),
        "name": review.name,
        "rating":parseInt(review.rating),
        "comments": review.comments,
        "createdAt": parseInt(review.createdAt)
     };

     fetch(`http://localhost:1337/reviews`, {
       method: 'POST',
       body: JSON.stringify(reviewParameters),
       headers: new Headers({
            'Content-Type': 'application/json'
        })
     }).then((response) => {
        console.log("review added successfully to the server");
     }).catch((error) => {
        console.log(error);
     });
   }



    static sendWhenOnline (offlineReview) {
        localStorage.setItem('offlineReviewData',JSON.stringify(offlineReview));
        window.addEventListener('online', (event) => {
            let review = JSON.parse(localStorage.getItem('offlineReviewData'));
            if (review !== null) {
                DBHelper.addReview(review);
                localStorage.removeItem('offlineReviewData');
            }
        });
    }
}
