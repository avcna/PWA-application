let deferredPrompt;

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(function () {
    console.log("service worker registered");
  });
}

self.addEventListener("beforeInstallPrompt", function (event) {
  console.log("before prompt");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
