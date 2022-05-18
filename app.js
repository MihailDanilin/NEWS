import { myHTTP } from "./api.js";

let newsCont = document.querySelector(".grid");

document.addEventListener("DOMContentLoaded", ()=>{//Инициализация селекта
  let elems = document.querySelectorAll("select");
  let options1 = elems[0].querySelectorAll("option");
  let options2 = elems[1].querySelectorAll("option");
  let instances1 = M.FormSelect.init(elems[0], options1);
  let instances2 = M.FormSelect.init(elems[1], options2);
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
  //Функция отправки запроса по пользовательским параметром.
  newsCont.innerHTML = "";
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
  news.forEach((e) => {
    let newsElem = newsTemplate(e);
    fragment += newsElem;
  });

  newsCont.insertAdjacentHTML("afterbegin", fragment);
}
function newsTemplate(news) {
  //Создание шаблона новости
  return `<div class="col s12">
  <div class="card">
    <div class="card-image">
      <img src="${news.urlToImage || "news.jpg"}" />
    </div>
    <div class="card-content">
     <span class="card-title">${news.title || "News"}</span>
      <p>
        ${news.description || "Learn more in the site"}
      </p>
    </div>
    <div class="card-action">
      <a target="_blank" href="${news.url}">Learn more</a>
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
