import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

const dataSource = new ProductData("tents");
const listElement = document.querySelector(".product-list");

const productList = new ProductList("tents", dataSource, listElement);
productList.init();

// Dynamic Search and Filter Feature
const searchInput = document.querySelector("#search-input");

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const productItems = document.querySelectorAll(".product-card, .product-list li");

    productItems.forEach((item) => {
      const textContent = item.textContent.toLowerCase();
      if (textContent.includes(searchTerm)) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });
}