var CACHES_STATIC = 'static-v10';
var CACHES_DYNAMIC = 'dynamic-v3';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener("install", function (event) {
  console.log("Installing SW", event);
  event.waitUntil(caches.open(CACHES_STATIC).then(function (cache) {
    console.log("sw precache");
    cache.addAll(STATIC_FILES);
  }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keyList) {
    return Promise.all(keyList.map(function(key){
      if (key !== CACHES_STATIC && key !== CACHES_DYNAMIC){
        console.log("Deleting old cache...", key)
        return caches.delete(key);
      }
    }))
  }))
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener("fetch", function (event) {
  var url = 'https://httpbin.org/get';

  if(event.request.url.indexOf(url) > -1){
    event.respondWith(
   caches.open(CACHES_DYNAMIC).then(function (cache){
    return fetch(event.request).then(function(res){
      cache.put(event.request, res.clone());
      return res;
    })
   })
  );
  }
  else if(isInArray(event.request.url, STATIC_FILES)){
    event.respondWith(
      caches.match(event.request)
    )
  }
  else{
    event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response){
        return response;
      }
      else{
        return fetch(event.request).
        then(
          function(res){
            return caches.open(CACHES_DYNAMIC)
            .then(function(cache){
              cache.put(event.request.url, res.clone())
              return res;
            })
          }
        )
        .catch (function(error){
          return caches.open(CACHES_STATIC).then(function(cache){
            if(event.request.headers.get('accept').includes('text/html')){
              return cache.match('/offline.html');
            }
            
          });
        })
      }
    }))
  }
  
});

// cache then network
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       if (response){
//         return response;
//       }
//       else{
//         return fetch(event.request).
//         then(
//           function(res){
//             return caches.open(CACHES_DYNAMIC)
//             .then(function(cache){
//               cache.put(event.request.url, res.clone())
//               return res;
//             })
//           }
//         )
//         .catch (function(error){
//           return caches.open(CACHES_STATIC).then(function(cache){
//             return cache.match('/offline.html');
//           });
//         })
//       }
//     })
//   );
// });



// network then cache
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     fetch(event.request).then(
//       function(response){
//         return caches.open(CACHES_DYNAMIC)
//             .then(function(cache){
//               cache.put(event.request.url, res.clone())
//               return res;
//             })
//       }
//     ).catch(function (error) {
//       return caches.match(event.request)
//     })
//   );
// });


// cache only
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//     })
//   );
// });


// Network only
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     fetch(event.request)
//     )
// });
