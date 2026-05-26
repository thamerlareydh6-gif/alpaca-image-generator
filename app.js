let alpacaData = {};
let layersOrder = [];
let currentSelection = {};
let activeCategory = "hair";

const previewContainer = document.getElementById("alpaca-preview");
const categoryPicker = document.getElementById("category-picker");
const stylePicker = document.getElementById("style-picker");

async function initApplication() {
  const response = await fetch("assets.json");
  const config = await response.json(); // FIXED: Changed .fetch() to .json()

  alpacaData = config.categories;
  layersOrder = config.layerOrder; // FIXED: Changed to singular .layerOrder matching the JSON file

  layersOrder.forEach((category, index) => {
    const img = document.createElement("img");
    img.id = `layer-${category}`;
    img.style.zIndex = index + 1;

    if (category === "base") {
      img.src = "alpaca/nose.png";
    } else {
      currentSelection[category] = alpacaData[category][0];
      img.src = `alpaca/${category}/${currentSelection[category]}.png`;
    }
    previewContainer.appendChild(img);
  });

  activeCategory = Object.keys(alpacaData)[0];

  renderCategoryTabs();
  renderStyles(activeCategory);
}

function renderCategoryTabs() {
  categoryPicker.innerHTML = "";

  Object.keys(alpacaData).forEach((category) => {
    const btn = document.createElement("button");
    btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    btn.classList.add("btn-category");
    btn.dataset.category = category;

    if (category === activeCategory) btn.classList.add("active");

    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".btn-category")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = category;
      renderStyles(activeCategory);
    });

    categoryPicker.appendChild(btn); // FIXED: Appending to categoryPicker wrapper element instead of string loop variable
  });
}

function renderStyles(category) {
  stylePicker.innerHTML = "";

  alpacaData[category].forEach((style) => {
    const btn = document.createElement("button");
    btn.textContent = style.charAt(0).toUpperCase() + style.slice(1);
    btn.classList.add("btn-style");

    if (currentSelection[category] === style) {
      btn.classList.add("active");
    }

    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".btn-style")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      updateAlpaca(category, style);
    });

    stylePicker.appendChild(btn);
  });
}

function updateAlpaca(category, style) {
  currentSelection[category] = style;

  const targetLayer = document.getElementById(`layer-${category}`);
  if (targetLayer) {
    targetLayer.src = `alpaca/${category}/${style}.png`;
  }
}

document.getElementById("btn-random").addEventListener("click", () => {
  Object.keys(alpacaData).forEach((category) => {
    const options = alpacaData[category];
    const randomIndex = Math.floor(Math.random() * options.length);
    const randomStyle = options[randomIndex];

    updateAlpaca(category, randomStyle);
  });

  renderStyles(activeCategory);
});

document.getElementById("btn-download").addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");

  let loadedCount = 0;
  let imagesArray = [];

  layersOrder.forEach((category, index) => {
    const img = new Image();
    imagesArray[index] = img;

    img.onload = () => {
      loadedCount++;

      if (loadedCount === layersOrder.length) {
        imagesArray.forEach((loadedImg) => {
          ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);
        });

        const link = document.createElement("a");
        link.download = "my-alpaca.png";
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src =
      category === "base"
        ? "alpaca/nose.png"
        : `alpaca/${category}/${currentSelection[category]}.png`;
  });
});

initApplication();
