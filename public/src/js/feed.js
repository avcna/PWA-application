var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);

function openCreatePostModal() {
  // createPostArea.style.display = "block";
  // setTimeout(function () {
    createPostArea.style.transform = "translateY(0)";
  // }, 1);

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (answer) {
      console.log(answer.outcome);

      if (answer.outcome === "dismissed") {
        console.log("user cancelled installation");
      } else {
        console.log("user added to homescreen");
      }
    });
    deferredPrompt = null;
  }
  // if ("serviceWorker" in navigator){
  //   navigator.serviceWorker.getRegistrations().then(function (registrations) {
  //     for (var i=0; i<registrations.length; i++) {
  //       registrations[i].unregister();
  //     }
  //   })
  // }
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function onSaveBtnClicked(event) {
  console.log("click!");
  if ("caches" in window) {
    caches.open("user-requested").then(function (cache) {
      cache.add("https://httpbin.org/get");
      cache.add("/src/images/sf-boat.jpg");
    });
  }
}

function clearCard() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function updateUI(data) {
  clearCard();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.style.color = "white";
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  // var cardSaveBtn = document.createElement('button');
  // cardSaveBtn.textContent = 'Save';
  // cardSaveBtn.addEventListener('click', onSaveBtnClicked);
  // cardSupportingText.appendChild(cardSaveBtn);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

var url = "https://pwagram-ad7b5-default-rtdb.firebaseio.com/post.json";
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    console.log("from web", data);
    updateUI(dataArray);
  });

if ("indexedDB" in window) {
  readAllData("posts").then(function (data) {
    if (!networkDataReceived) {
      console.log("from cache: " + data);
      updateUI(data);
    }
  });
}

function closeCreatePostModal() {
  //createPostArea.style.display = "none";
  createPostArea.style.transform = "translateY(100vh)";
}
