import { myHTTP } from "./api.js";

let newsCont = document.querySelector(".grid");
let favourite = document.querySelector(".favourite")
let modal = document.querySelector(".modal-content")
let isOpen = false
let indicator = document.querySelector(".news-indicator")
let newsNum = 0

document.addEventListener("DOMContentLoaded", ()=>{//Инициализация селекта
  let elems = document.querySelectorAll("select");
  let instances1 = M.FormSelect.init(elems[0]);
  let instances2 = M.FormSelect.init(elems[1]);
  let popUp = document.querySelector('.modal');
  let instances = M.Modal.init(popUp);
  let newArray = JSON.parse(localStorage.getItem("favourite"))
  if(newArray){
    newArray.forEach((e)=>{
      modal.insertAdjacentHTML("afterbegin", favouriteCardTemplate(e))
    })
    indicator.style.display = "flex"
    indicator.textContent = newArray.length
    newsNum = newArray.length
  }
  checkFavouriteNews()
});


let http = myHTTP(); //Создание сервиса для обращения к API
let service = () => {
  let apiKey = "7d8c59871fd54290a76606e1e358b3c6";
  let baseURL = "https://newsapi.org/v2";
  return {
    everything(query, cb) {
      http.get(`${baseURL}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
    topHeadlines(country = "ru", category, cb) {
      category
      ?
      http.get(
        `${baseURL}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      )
      :
      http.get(
        `${baseURL}/top-headlines?country=${country}&apiKey=${apiKey}`,
        cb
      );
    },
  };
};
let newsService = service();
let form = document.forms["news-finder"];
let countrySelect = form.elements["country"];
let category = form.elements["category"];
let input = form.elements["search"];

form.addEventListener("submit", (event) => {
  //Отправка формы
  event.preventDefault();
  loadNews();
});
function loadNews() {
  //Функция отправки запроса по пользовательским параметрам.
  newsCont.innerHTML = "";
  if(document.querySelectorAll(".material-tooltip").length){
    document.querySelectorAll(".material-tooltip").forEach((e)=>{
      e.remove()
    })
  }
  showPreloader();
  if (input.value) {
    newsService.everything(input.value, onGetResponse);
    return;
  }
  newsService.topHeadlines(countrySelect.value, category.value, onGetResponse);
}

function onGetResponse(err, res) {
  //Обработка ответа от сервера
  removePreloader();
  if (err) {
    showAlert(err);
    return;
  }
  console.log(res);
  if (!res.articles.length) {
    showAlert("Found nothing. Try again");
    return;
  }
  renderNews(res.articles);
}
function renderNews(news) {
  //Рендер новостей
  let fragment = "";
  news.forEach((e,i) => {
    let newsElem = newsTemplate(e,i);
    fragment += newsElem;
  });

  newsCont.insertAdjacentHTML("afterbegin", fragment);
  let tooltipped = document.querySelectorAll('.tooltipped');
  let instances = M.Tooltip.init(tooltipped);
}
function newsTemplate({urlToImage, title, description, url}, i) {
  //Создание шаблона новости
  return `<div class="col s12">
  <div class="card">
    <div class="card-image">
      <img src="${urlToImage || "news.jpg"}" alt="Access is prohibited"/>
    </div>
    <div class="card-content">
     <span class="card-title">${title || "News"}</span>
      <p>
        ${description || "Learn more in the site"}
      </p>
    </div>
    <div class="card-action">
      <a target="_blank" href="${url}">Learn more</a>
      <img class="tooltipped add" data-position="left" data-number="${i}" data-tooltip="Add to favourite" src="favourite.png" alt="">
      <img class="added"src="added.png" alt="">
    </div>
  </div>
</div>`;
}
function showPreloader() {
  //Рендер прелоадера
  document.querySelector(".form-cont").insertAdjacentHTML(
    "afterend",
    `  <div class="preloader-wrapper big active">
    <div class="spinner-layer spinner-blue-only">
      <div class="circle-clipper left">
        <div class="circle"></div>
      </div><div class="gap-patch">
        <div class="circle"></div>
      </div><div class="circle-clipper right">
        <div class="circle"></div>
      </div>
    </div>
  </div>`
  );
}
function removePreloader() {
  //Удаление прелоадера
  document.querySelector(".preloader-wrapper").remove();
}
function showAlert(err) {
  //Рендер окна ошибки
  M.toast({ html: err, classes: "custom-toast" });
}

// favourite.addEventListener("click", openFavouriteModal)
// function openFavouriteModal(){
//   modal.style.display = "flex"
//   isOpen = true
// }
// window.addEventListener("click", (event)=>{
//   if(!event.target.closest(".favourite-modal") && isOpen){
//     modal.classList.remove("animate__flipInX")
//     modal.classList.add("animate__flipOutX")
//     setTimeout(function(){
//       modal.style.display = "none"
//     },1000)
//     isOpen = false
//   }
//   if(event.target.classList.contains("favourite")){
//     modal.style.display = "flex"
//     modal.classList.add("animate__flipInX")
//     modal.classList.remove("animate__flipOutX")
//     isOpen = true
//   }
// })

document.addEventListener("click", (event)=>{
  if(!event.target.classList.contains("add")){
    return
  }
  let addElement = event.target.parentElement.lastElementChild
  let number = event.target.dataset.number
  let currentCard = event.target.closest(".card")

  let obj = {
    header:currentCard.querySelector(".card-title").textContent,
    link:currentCard.querySelector("a").href
  }
  let favouriteHeader = document.querySelectorAll(".favourite-header")
  let headers = []
  favouriteHeader.forEach(e => {
    headers.push(e.textContent)
  })
  let isAdded = headers.some(el => {
    return el == obj.header
  })
  if(isAdded){
    alert("This news has already been added")
    return
  }
  event.target.remove()
  renderFavouriteCard(obj)
  document.querySelectorAll(".material-tooltip")[number].style.display = "none"
  addElement.style.display = "inline-block"

})
function renderFavouriteCard(obj){
  modal.insertAdjacentHTML("afterbegin", favouriteCardTemplate(obj))
  setStorage(obj, true)
  checkFavouriteNews()
  changeIndicatorValue(true)
}
function favouriteCardTemplate({header, link}){
  return `<div class="favourite-item">
  <h3 class="favourite-header">${header}</h3>
  <a target="_blank" href="${link}">LEARN MORE</a>
  <i class="material-icons delete">delete</i>
</div>`
}

modal.addEventListener("click", (event)=>{
  if(event.target.classList.contains("delete")){
    if(confirm("Do you really want to delete the news?")){
      let favouriteNews = event.target.closest(".favourite-item")
      let obj = {
        header:favouriteNews.querySelector(".favourite-header").textContent,
        link:favouriteNews.querySelector("a").href
      }
      setStorage(obj, false)
      event.target.closest(".favourite-item").remove()
      checkFavouriteNews()
      changeIndicatorValue(false)

    }

  }  
})
// #2ECC71

function checkFavouriteNews(){
  if(!modal.children.length){
    modal.insertAdjacentHTML("afterbegin", `<p class="nothing">There are not favourite news</p>`)
    indicator.style.display = "none"
    return
  }
  if(document.querySelector(".nothing")){
    document.querySelector(".nothing").remove()
  }
  indicator.style.display = "flex"
}
function changeIndicatorValue(increase){
  if(increase){
    newsNum+=1
  }
  else{
    newsNum-=1
  }
  indicator.textContent = newsNum
}
function setStorage(obj, add){
  if(add){
    if(!localStorage.getItem("favourite")){
      localStorage.setItem("favourite", JSON.stringify([obj]))
    }
    else{
      let newArray = JSON.parse(localStorage.getItem("favourite"))
      newArray.push(obj)
      localStorage.setItem("favourite", JSON.stringify(newArray))
    }
  }
  else{
    let newArray = JSON.parse(localStorage.getItem("favourite"))
    if(newArray.length == 1){
      localStorage.removeItem("favourite")
    }

    else{
      let deletedArray = newArray.filter((e)=>{
        return e.header !== obj.header
      })
      localStorage.setItem("favourite", JSON.stringify(deletedArray))
    }
  }
}
