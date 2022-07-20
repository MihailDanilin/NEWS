import { myHTTP } from "./api.js";

let newsCont = document.querySelector(".grid");
let modal = document.querySelector(".modal-content");
let indicator = document.querySelector(".news-indicator");
let newsNum = 0; //кол-во избранных новостей
let form = document.forms["news-finder"];
let countrySelect = form.elements["country"];
let category = form.elements["category"];
let input = form.elements["search"];

//событие загрузки HTML
document.addEventListener("DOMContentLoaded", () => {
  //Инициализация компонентов Materialize
  let selects = document.querySelectorAll("select");
  let popUp = document.querySelector(".modal");
  M.FormSelect.init(selects[0]);
  M.FormSelect.init(selects[1]);
  M.Modal.init(popUp);
  loadFavouriteNews();
  checkFavouriteNews();
});

//удаление избранной новости
modal.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete")) {
    if (confirm("Do you really want to delete the news?")) {
      let favouriteNews = event.target.closest(".favourite-item");
      let obj = {
        header: favouriteNews.querySelector(".favourite-header").textContent,
        link: favouriteNews.querySelector("a").href,
      };
      setStorage(obj, false);
      event.target.closest(".favourite-item").remove();
      checkFavouriteNews();
      changeIndicatorValue(false);
    }
  }
});

//Отправка формы
form.addEventListener("submit", (event) => {
  event.preventDefault();
  loadNews();
});
//Добавление избранной новости
document.addEventListener("click", (event) => {
  //Проверка на клик по кнопке добавить в избранное
  if (!event.target.classList.contains("add")) {
    return;
  }
  let addElement = event.target.parentElement.lastElementChild;
  let number = event.target.dataset.number;
  let currentCard = event.target.closest(".card");
  //Объект избранной новости
  let obj = {
    header: currentCard.querySelector(".card-title").textContent,
    link: currentCard.querySelector("a").href,
  };
  if (checkAddedNews(obj.header)) {
    alert("This news has already been added");
    return;
  }
  //удаление кнопки добавить, успешное добавление
  event.target.remove();
  renderFavouriteCard(obj);
  document.querySelectorAll(".material-tooltip")[number].style.display = "none";
  addElement.style.display = "inline-block";
});

//Рендер избранных новостей из хранилища
function loadFavouriteNews() {
  let newArray = JSON.parse(localStorage.getItem("favourite"));
  if (newArray) {
    newArray.forEach((e) => {
      modal.insertAdjacentHTML("afterbegin", favouriteCardTemplate(e));
    });
    indicator.style.display = "flex";
    indicator.textContent = newArray.length;
    newsNum = newArray.length;
  }
}

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
        ? http.get(
            `${baseURL}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
            cb
          )
        : http.get(
            `${baseURL}/top-headlines?country=${country}&apiKey=${apiKey}`,
            cb
          );
    },
  };
};

let newsService = service();

//Функция отправки запроса по пользовательским параметрам.
function loadNews() {
  newsCont.innerHTML = "";
  if (document.querySelectorAll(".material-tooltip").length) {
    document.querySelectorAll(".material-tooltip").forEach((e) => {
      e.remove();
    });
  }
  showPreloader();
  if (input.value) {
    newsService.everything(input.value, onGetResponse);
    return;
  }
  newsService.topHeadlines(countrySelect.value, category.value, onGetResponse);
}

//Обработка ответа от сервера
function onGetResponse(err, res) {
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

//Рендер новостей
function renderNews(news) {
  let fragment = "";
  news.forEach((e, i) => {
    let newsElem = newsTemplate(e, i);
    fragment += newsElem;
  });
  newsCont.insertAdjacentHTML("afterbegin", fragment);
  tooltipInit();
}
//инициализация tooltip'ов
function tooltipInit() {
  let tooltipped = document.querySelectorAll(".tooltipped");
  M.Tooltip.init(tooltipped);
}

//Создание шаблона новости
function newsTemplate({ urlToImage, title, description, url }, i) {
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
//Рендер прелоадера
function showPreloader() {
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
//Удаление прелоадера
function removePreloader() {
  document.querySelector(".preloader-wrapper").remove();
}
//Рендер окна ошибки
function showAlert(err) {
  M.toast({ html: err, classes: "custom-toast" });
}

//Проверяет повторное добавление новости в избранное
function checkAddedNews(header) {
  let favouriteHeader = document.querySelectorAll(".favourite-header");
  let headers = [];
  favouriteHeader.forEach((e) => {
    headers.push(e.textContent);
  });
  return headers.some((el) => {
    return el == header;
  });
}
//рендер избранных новостей, добавление в хранилище
function renderFavouriteCard(obj) {
  modal.insertAdjacentHTML("afterbegin", favouriteCardTemplate(obj));
  setStorage(obj, true);
  checkFavouriteNews();
  changeIndicatorValue(true);
}
//шаблон избранных новостей
function favouriteCardTemplate({ header, link }) {
  return `<div class="favourite-item">
  <h3 class="favourite-header">${header}</h3>
  <a target="_blank" href="${link}">LEARN MORE</a>
  <i class="material-icons delete">delete</i>
</div>`;
}
//проверка на количество изб новостей
function checkFavouriteNews() {
  if (!modal.children.length) {
    modal.insertAdjacentHTML(
      "afterbegin",
      `<p class="nothing">There are not favourite news</p>`
    );
    indicator.style.display = "none";
    return;
  }
  if (document.querySelector(".nothing")) {
    document.querySelector(".nothing").remove();
  }
  indicator.style.display = "flex";
}
//изменение значения индикатора
function changeIndicatorValue(increase) {
  if (increase) {
    newsNum += 1;
  } else {
    newsNum -= 1;
  }
  indicator.textContent = newsNum;
}

//добавление и удаление избранных новостей в хранилище
function setStorage(obj, add) {
  if (add) {
    if (!localStorage.getItem("favourite")) {
      localStorage.setItem("favourite", JSON.stringify([obj]));
    } else {
      let newArray = JSON.parse(localStorage.getItem("favourite"));
      newArray.push(obj);
      localStorage.setItem("favourite", JSON.stringify(newArray));
    }
  } else {
    let newArray = JSON.parse(localStorage.getItem("favourite"));
    if (newArray.length == 1) {
      localStorage.removeItem("favourite");
    } else {
      let deletedArray = newArray.filter((e) => {
        return e.header !== obj.header;
      });
      localStorage.setItem("favourite", JSON.stringify(deletedArray));
    }
  }
}
