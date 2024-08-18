self.addEventListener("install", function (event) {
  console.log("Installing SW", event);
});

self.addEventListener("activate", function (event) {
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});
