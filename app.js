import { myHTTP } from "./api.js";

let newsCont = document.querySelector(".grid");
let favourite = document.querySelector(".favourite")
let modal = document.querySelector(".favourite-modal")
let isOpen = false

document.addEventListener("DOMContentLoaded", ()=>{//Инициализация селекта
  let elems = document.querySelectorAll("select");
  let instances1 = M.FormSelect.init(elems[0]);
  let instances2 = M.FormSelect.init(elems[1]);
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

document.addEventListener('DOMContentLoaded', function() {
  let elems = document.querySelectorAll('.dropdown-trigger');
  let instances = M.Dropdown.init(elems, {
    closeOnClick:false,
    onOpenStart:()=>{
      modal.classList.add("animate__flipInX")
      modal.classList.remove("animate__flipOutX")
    },
    onCloseStart:()=>{
      modal.classList.remove("animate__flipInX")
      modal.classList.add("animate__flipOutX")
    },
    inDuration:1000,
    outDuration:1000,
  });
});

document.addEventListener("click", (event)=>{
  if(!event.target.classList.contains("add")){
    return
  }
  let addElement = event.target.parentElement.lastElementChild
  let number = event.target.dataset.number
  event.target.remove()
  document.querySelectorAll(".material-tooltip")[number].style.display = "none"
  addElement.style.display = "inline-block"
})
// #2ECC71