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

workboxSW.precache([]);

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

