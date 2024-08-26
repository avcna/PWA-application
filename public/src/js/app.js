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
else {
  console.log("no sw")
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("before prompt");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});
