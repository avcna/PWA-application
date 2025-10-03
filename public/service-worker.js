importScripts("workbox-sw.prod.v2.1.3.js");
importScripts("/src/js/idb.js");
importScripts("/src/js/utility.js");

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts",
    cacheExpiration: {
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
    },
  })
);

workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "material-css",
  })
);

workboxSW.router.registerRoute(
  /.*(?:firebasestorage\.googleapis)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "post-images",
  })
);

workboxSW.router.registerRoute(
  "https://pwagram-ad7b5-default-rtdb.firebaseio.com/post.json",
  function (args) {
    return fetch(args.event.request).then(function (res) {
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
            writeData("posts", data[key]);
            // .then(function(){
            //   deleteItemFromData("posts", key)
            // });
          }
        });

      return res;
    });
  }
);

workboxSW.router.registerRoute(
  function (routeData) {
    return routeData.event.request.headers.get("accept").includes("text/html");
  },
  function (args) {
    return caches.match(args.event.request).then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(args.event.request)
          .then(function (res) {
            return caches.open("dynamic").then(function (cache) {
              cache.put(args.event.request.url, res.clone());
              return res;
            });
          })
          .catch(function (error) {
            return caches.match("/offline.html").then(function (res) {
              return res;
            });
          });
      }
    });
  }
);

workboxSW.precache([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "290068c5bd91836b0f4df6339e8644e9"
  },
  {
    "url": "manifest.json",
    "revision": "8b1e669d66966c1bdf0c3a3f56f30db8"
  },
  {
    "url": "offline.html",
    "revision": "331fd81a54469a1b51a21feac624ff27"
  },
  {
    "url": "src/css/app.css",
    "revision": "d5f922d2b1636bc50511164474b53805"
  },
  {
    "url": "src/css/feed.css",
    "revision": "da299e2ee6c3919779c6169372f32785"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "96c9b6a4c1a041aecf363e96bdbe7541"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "62fc0f5c696e456b7b628602eb434ca9"
  },
  {
    "url": "src/js/fetch.min.js",
    "revision": "f258cf8e71371bd6f158a7fffe7df405"
  },
  {
    "url": "src/js/idb.min.js",
    "revision": "d8dd6e8a931d2a556beeaae3bb16c985"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.min.js",
    "revision": "f874d37f9e9202ba09b3f2e4995c4827"
  },
  {
    "url": "src/js/utility.min.js",
    "revision": "d111ac5db0e18deaedc213a4f4bcc7de"
  }
]);

self.addEventListener("sync", function (event) {
  console.log("background syncing...", event);
  if (event.tag === "sync-new-post") {
    console.log("syncing new post");
    event.waitUntil(
      readAllData("sync-posts").then(function (data) {
        //console.log(data)
        for (var dt of data) {
          var postData = new FormData();
          postData.append("id", dt.id);
          postData.append("title", dt.title);
          postData.append('location', dt.location);
          postData.append("rawLocationLat", dt.rawLocation.lat);
          postData.append("rawLocationLng", dt.rawLocation.lng);
          postData.append("file", dt.picture, dt.id+'.png');
          fetch(
            "http://127.0.0.1:5001/pwagram-ad7b5/us-central1/storePostData",
            {
              method: "POST",
              body: postData,
            }
          )
            .then(function (res) {
              console.log("data sent ", res);
              if (res.ok) {
                console.log(dt);
                res.json().then(function (resData) {
                  deleteItemFromData("sync-posts", resData.id);
                });
              }
            })
            .catch(function (error) {
              console.log("error while sending data ", error);
            });
        }
      })
    );
  }
});

self.addEventListener("notificationclick", function (event) {
  var notification = event.notification;
  var action = event.action;

  console.log(notification);

  if (action === "confirm") {
    console.log("Confirm was chosen");
    notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
      .then(function (clis) {
        var client = clis.find(function(c){
          return c.visiblityState === "visible";
        });

        if (client !== undefined){
          client.navigate(notification.data.url)
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }
        notification.close();
      })
    );
  }
});

self.addEventListener("notificationclose", function (event) {
  console.log("Notification was closed: ", event);
});


self.addEventListener("push", function (event) {
  console.log("push received: ", event);

  var data = { title: "New", content: "Something happen", openUrl:"/" };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  var option = {
    body: data.content,
    icon: "/src/images/icons/app-icon-96x96.png",
    badge: "/src/images/icons/app-icon-96x96.png",
    data: {
      url: data.openUrl,
    }
  };
  event.waitUntil(
    self.registration.showNotification(data.title, option)
  )
});

