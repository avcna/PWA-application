importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

var CACHES_STATIC = "static-v10";
var CACHES_DYNAMIC = "dynamic-v3";
var STATIC_FILES = [
  "/",
  "/index.html",
  "/offline.html",
  "/src/js/app.js",
  "/src/js/feed.js",
  "/src/js/idb.js",
  "/src/js/promise.js",
  "/src/js/fetch.js",
  "/src/js/material.min.js",
  "/src/css/app.css",
  "/src/css/feed.css",
  "/src/images/main-image.jpg",
  "https://fonts.googleapis.com/css?family=Roboto:400,700",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
];

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName).then(function(cache){
//     cache.keys().then(function(keys){
//       if (keys.length > maxItems){
//         cache.delete(keys[0]).then(function(){
//           trimCache(cacheName, maxItems);
//         });
//       }
//     });
//   });
// }

self.addEventListener("install", function (event) {
  console.log("Installing SW", event);
  event.waitUntil(
    caches.open(CACHES_STATIC).then(function (cache) {
      console.log("sw precache");
      cache.addAll(STATIC_FILES);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== CACHES_STATIC && key !== CACHES_DYNAMIC) {
            console.log("Deleting old cache...", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) {
    // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log("matched ", string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener("fetch", function (event) {
  var url = "https://pwagram-ad7b5-default-rtdb.firebaseio.com/post";

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      fetch(event.request).then(function (res) {
        //trimCache(CACHES_DYNAMIC, 3);
        //cache.put(event.request, res.clone());
        var clonedRes = res.clone();
        clearAllData("posts")
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            console.log("tes: " + data);
            for (var key in data) {
              writeData("posts", data[key])
              // .then(function(){
              //   deleteItemFromData("posts", key)
              // });
            }
          });

        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              return caches.open(CACHES_DYNAMIC).then(function (cache) {
                //trimCache(CACHES_DYNAMIC, 3);
                cache.put(event.request.url, res.clone());
                return res;
              });
            })
            .catch(function (error) {
              return caches.open(CACHES_STATIC).then(function (cache) {
                if (event.request.headers.get("accept").includes("text/html")) {
                  return cache.match("/offline.html");
                }
              });
            });
        }
      })
    );
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
// });s

self.addEventListener("sync", function (event) {
  console.log("background syncing...", event);
  if (event.tag === "sync-new-post"){
    console.log("syncing new post");
    event.waitUntil(
      readAllData("sync-posts").then(
        function(data){
          for (var dt of data){
            fetch('https://pwagram-ad7b5-default-rtdb.firebaseio.com/post.json',{
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                id:dt.id,
                title: dt.title,
                location: dt.location,
                image:"https://firebasestorage.googleapis.com/v0/b/pwagram-ad7b5.appspot.com/o/sf-boat.jpg?alt=media&token=0452a7d5-1433-4251-bd35-3f1a66a10649"
              }),
            }).then(function(res){
              console.log("data sent ", res)
              if (res.ok){
                console.log(dt)
                deleteItemFromData("sync-posts", dt.id)
              }
            }).catch(function(error){
              console.log("error while sending data ", error)
            })
          }
          
        }
      )
      
    );
  }
})
