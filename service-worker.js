var cacheName = 'weatherPWA-step-6-1';
var dataCacheName = 'weatherData-v1';

var filesToCache = [
  '/',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/images/clear.png',
  '/images/cloudy-scattered-showers.png',
  '/images/cloudy.png',
  '/images/fog.png',
  '/images/ic_add_white_24px.svg',
  '/images/ic_refresh_white_24px.svg',
  '/images/partly-cloudy.png',
  '/images/rain.png',
  '/images/scattered-showers.png',
  '/images/sleet.png',
  '/images/snow.png',
  '/images/thunderstorm.png',
  '/images/wind.png'
];
/* EXAMPLE: 
var urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];
*/

/*For the most basic example, you need to define a callback
 for the install event and decide which files you want to cache.*/
self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  /*
  Inside of our install callback, we need to take the following steps:
    - Open a cache.
    - Cache our files.
    - Confirm whether all the required assets are cached or not.
  */
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    /* This code ensures that your service worker updates its cache whenever 
    any of the app shell files change. In order for this to work, you'd need 
    to increment the cacheName variable at the top of your service worker file. */
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          // it doesn't delete the data cache when it cleans up the app shell cache.
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // self.clients.claim() fixes a corner case in which the app wasn't returning the latest data. 
  return self.clients.claim();
});



self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  /* 
    Intercept the network request and cache the response
    We need to modify the service worker to intercept requests to the weather API 
    and store their responses in the cache, so we can easily access them later. 
    In the cache-then-network strategy, we expect the network response to be the 
    ‘source of truth', always providing us with the most recent information. 
  */
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      // caches.match() evaluates the web request that triggered the fetch event, and checks to see if it's available in the cache. 
      caches.match(event.request).then(function(response) {
        // It then either responds with the cached version, or uses fetch to get a copy from the network. 
        // The response is passed back to the web page with e.respondWith().
        return response || fetch(event.request);
      })
    );
  }
});
