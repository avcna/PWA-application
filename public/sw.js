self.addEventListener("install", function (event) {
  console.log("Installing SW", event);
});

self.addEventListener("activate", function (event) {
  console.log("Activating SW", event);
  return self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  console.log("SW fetching something", event);
  event.respondWith(fetch(event.request));
});
