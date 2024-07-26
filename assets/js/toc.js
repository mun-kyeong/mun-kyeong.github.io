async function createToc() {
  console.log("createToc");
  let selectedIndex = 0;
  const tags = document.querySelectorAll("h1,h2");
  const toc = document.querySelector(".toc");

  tags.forEach((tag) => {
    if (["sitetitle", "posttitle"].includes(tag.className)) return;
    const ul = document.createElement("ul");
    ul.classList.add("toc-title");
    ul.textContent = tag.textContent;
    toc.appendChild(ul);
  });

  const tocItems = document.querySelectorAll(".toc-title");
  console.log("tocItems : ", tocItems);
  tocItems.forEach((item, index) => (item.dataset.index = index)),
    tags.forEach((tag, index) => (tag.dataset.index = index));

  toc.addEventListener("click", (e) => {
    if (e.target.matches(".toc-title")) {
      const index = e.target.dataset.index - "0" + 2;
      tags[index].scrollIntoView();
      tocItems[selectedIndex].classList.remove("selected");
      selectedIndex = e.target.dataset.index - "0";
      console.log("selectedIndex : ", selectedIndex);
      tocItems[selectedIndex].classList.add("selected");
    }
  });
  const observer = new IntersectionObserver((entries) => {
    if (["sitetitle", "posttitle"].includes(entries[0].target.className))
      return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tocItems[selectedIndex].classList.remove("selected");
        selectedIndex = entry.target.dataset.index - "0" - 2;
        tocItems[selectedIndex].classList.add("selected");
      } else if (
        entry.boundingClientRect.y > 100 &&
        entry.boundingClientRect.y < -100
      ) {
        tocItems[selectedIndex].classList.remove("selected");
        selectedIndex = entry.target.dataset.index - "0" - 2 - 1;
        tocItems[selectedIndex].classList.add("selected");
      }
    });
  });
  tags.forEach((tag) => observer.observe(tag));
}

window.onload = async () => {
  console.log("OK");
  if (!document.querySelector("posttitle")) return;
  console.log("no");
  await createToc();
};
