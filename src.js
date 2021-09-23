const CORS_PROXY = `https://cors-proxy-86294.herokuapp.com/`;
// const TEST_RSS_URL = `https://www.google.com/alerts/feeds/15643140499855247148/8570744880942554774`;

function inIframe () {
  try {
      return window.self !== window.top;
  } catch (e) {
      return true;
  }
}

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

async function getResults(url) {
  url = CORS_PROXY + url;
  return await fetch(url)
    .then((response) => response.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/html"))
    .then((data) => {
      const items = [...data.querySelectorAll("entry"), ...data.querySelectorAll("item")];
      return Array.prototype.map.call(items, (el) => ({
        link: el.querySelector("link").getAttribute("href") || el.querySelector("link").innerText,
        title: el.querySelector("title").innerHTML
      }));
    });
}

function appendResults(results) {
  let html = ``;
  results.forEach(({ link, title }) => {
    html += `
      <article>
          <a href="${link}" target="_blank" rel="noopener">
            ${title}
          </a>
      </article>
    `;
  });
  document.getElementById("grid").insertAdjacentHTML("beforeend", html);
}

// Code that binds url search param to input element

let currentUrl = new URL(window.location.href);
let feedUrl = currentUrl.searchParams.get("url") || "";
const rssUrlInputEl = document.getElementById("rss-url");

rssUrlInputEl.addEventListener("input", debounce(e => {
  const url = e.target.value;
  getResults(url).then(appendResults).then(() => {
    currentUrl.searchParams.set("url", url);
    document.getElementById("embed-url").innerText = currentUrl;
    history.pushState({ url }, "", `?url=${url}`);
  });
}, 300))

if (feedUrl) {
  rssUrlInputEl.value = feedUrl;
  const forcedInputEvent = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  rssUrlInputEl.dispatchEvent(forcedInputEvent);
}

// url value binding ends here

if (!inIframe()) {
  document.getElementById("editor").classList.add("visible");
}

document.body.addEventListener("click", e => {
  let target = e.target;
  switch (target.tagName) {
    case "ARTICLE":
      target.querySelector("a").click();
      break;
  }
});