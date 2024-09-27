importScripts("workbox-sw.prod.v2.1.3.js");

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  /.*(?:googleapis|gstatic)\.com.*$/,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "google-fonts"
  })
);
workboxSW.precache([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "d9969e5db9835a5ed2ea10424a70fb14"
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
    "url": "service-worker.js",
    "revision": "01ee7f41f0c4320b09b6e9f6df5f42ac"
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
    "url": "src/js/app.js",
    "revision": "13f919787b9954c09d5240b38b65af5b"
  },
  {
    "url": "src/js/feed.js",
    "revision": "2670d55a3dc0394a2e56840bed127c76"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "fd92c12771bc68a18eb4a86cac463b33"
  },
  {
    "url": "sw-base.js",
    "revision": "59d9989a4abc7eb1ba11a07c283c9a28"
  },
  {
    "url": "sw.js",
    "revision": "1bd40a14c42cc95c228437f793eef427"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
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
  }
]);
