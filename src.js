const RSS_URL = `https://www.google.com/alerts/feeds/15643140499855247148/8570744880942554774`;

fetch(RSS_URL)
  .then((response) => response.text())
  .then((str) => new window.DOMParser().parseFromString(str, "text/html"))
  .then((data) => {
    const items = data.querySelectorAll("entry");
    let html = ``;
    items.forEach((el) => {
      html += `
        <article>
            <a href="${el.querySelector("link").getAttribute("href")}" target="_blank" rel="noopener">
              ${el.querySelector("title").innerHTML}
            </a>
        </article>
      `;
    });
    document.body.insertAdjacentHTML("beforeend", html);
  });

document.body.addEventListener("click", e => {
  let target = e.target;
  switch (target.tagName) {
    case "ARTICLE":
      target.querySelector("a").click();
      break;
  }
});