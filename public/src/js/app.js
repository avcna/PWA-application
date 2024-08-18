var deferredPrompt;
if(!window.Promise){
  window.Promise = Promise;
  }
  
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(function () {
      console.log("service worker registered!");
    })
    .catch(function (err) {
      console.log(err.message);
    });
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("before prompt");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

fetch("https://httpbin.org/ip").then((callback) =>
  callback.json().then(function (response) {
    console.log(response);
  })
);
