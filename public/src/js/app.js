var deferredPrompt;
var enableNotificationsButton = document.querySelector('.enable-notifications');

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

function askForPermission(){
  Notification.requestPermission(function(result){
    console.log("User choice:", result)
    if (result  !== 'granted'){
      console.log("No Notification permission granted")
    }
    else{
      
    }
  });
}

if ('Notification' in window){
  for(var i = 0; i <enableNotificationsButton.length; i++){
    enableNotificationsButton[i].style.display ='inline-block';
    enableNotificationsButton[i].addEventListener('click', askForPermission);
  } 
}