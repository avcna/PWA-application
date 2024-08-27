var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);

function openCreatePostModal() {
  createPostArea.style.display = "block";
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
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

function onSaveBtnClicked(event){
  console.log("click!");
  if ('caches' in window) {
    caches.open('user-requested').then(
      function(cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      }
    );
  }
}

function clearCard(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveBtn = document.createElement('button');
  // cardSaveBtn.textContent = 'Save';
  // cardSaveBtn.addEventListener('click', onSaveBtnClicked);
  // cardSupportingText.appendChild(cardSaveBtn);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

var url = 'https://httpbin.org/get';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log("from web", data);
    clearCard();
    createCard();
  });

if ('caches' in window){
  caches.match(url).then(function(response){
    if (response){
      return response.json()
    }
  }).then(function(data){
    if (!networkDataReceived){
      console.log("From cache", data);
      clearCard();
      createCard();
    }
  
  })
}


function closeCreatePostModal() {
  createPostArea.style.display = "none";
}
