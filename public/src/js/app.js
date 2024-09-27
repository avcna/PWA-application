var deferredPrompt;
var enableNotificationsButton = document.querySelectorAll(
  ".enable-notifications"
);

if (!window.Promise) {
  window.Promise = Promise;
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(function () {
      console.log("service worker registered!");
    })
    .catch(function (err) {
      console.log(err.message);
    });
} else {
  console.log("no sw");
}

window.addEventListener("beforeinstallprompt", function (event) {
  console.log("before prompt");
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ("serviceWorker" in navigator) {
    var options = {
      body: "You successfully subscribed the application",
      icon: "/src/images/icons/app-icon-96x96.png",
      image: "/src/images/sf-boat.jpg",
      dir: "ltr",
      lang: "en-US",
      vibrate: [100, 50, 200],
      badge: "/src/images/icons/app-icon-96x96.png",
      tag: "confirm-notification",
      renotify: true,
      actions: [
        {
          action: "confirm",
          title: "Okay",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
        {
          action: "cancel",
          title: "Cancel",
          icon: "/src/images/icons/app-icon-96x96.png",
        },
      ],
    };

    
    navigator.serviceWorker.ready.then(function (swReg) {
      swReg.showNotification("Successfully subscribed!", options);
    });
  }
}


function configurePushSub(){
  if (!('serviceWorker' in navigator)){
    return;
  }
  var reg;
  navigator.serviceWorker.ready
  .then(function (swReg) {
    reg = swReg;
    return swReg.pushManager.getSubscription();
  })
  .then(function(sub){
    if (sub === null){
      // create a new one
      var vapidPublicKey = "BM5HpsDv1BUE50Mm-EKY8hM-V2MHiewrU2RTAIP7dz4S1_CA4w42b4jKA_dnUmyFCkTf7ACdWY5B4uJnaFcJFoM";
      var convertedPublicKey = urlBase64ToUint8Array(vapidPublicKey)
      return reg.pushManager.subscribe(
        {
          userVisibleOnly: true,
          applicationServerKey: convertedPublicKey
        }
      )
    } else {
     // we already have one
    }
  })
  .then(function(newSub){
    console.log('New subscription:', newSub);
    return fetch('https://pwagram-ad7b5-default-rtdb.firebaseio.com/subscriptions.json',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newSub)
    })
  })
  .then(function(res){
    if (res.ok){
      displayConfirmNotification();
    }
    
  })
  .catch(function(err){
    console.log(err)
  })

}

function askForPermission() {
  Notification.requestPermission(function (result) {
    console.log("User choice:", result);
    if (result !== "granted") {
      console.log("No Notification permission granted");
    } else {
      //displayConfirmNotification();
      configurePushSub()
    }
  });
}

if ("Notification" in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationsButton.length; i++) {
    enableNotificationsButton[i].style.display = "inline-block";
    enableNotificationsButton[i].addEventListener("click", askForPermission);
  }
}
