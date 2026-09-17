import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  // Quita barras o ../ del inicio
  const imagePath = product.Image.replace(/^(\.\.\/|\/)+/, "");

  return `<li class="product-card">
    <a href="product_pages/index.html?product=${product.Id}">
      <img src="${imagePath}" alt="Image of ${product.Name}">
      <h2 class="card__brand">${product.Brand.Name}</h2>
      <h3 class="card__name">${product.NameWithoutBrand}</h3>
      <p class="product-card__price">$${product.FinalPrice}</p>
    </a>
  </li>`;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement;
    this.products = [];
  }

  async init() {
    const list = await this.dataSource.getData();
    this.products = this.filterProducts(list);
    this.sortProducts("name");
    this.renderList(this.products);
    this.setupSortListener();
  }

  filterProducts(list) {
    const targetIds = ["880RR", "985RF", "985PR", "344YJ"];
    return list.filter((product) => targetIds.includes(product.Id));
  }

  sortProducts(criteria) {
    if (criteria === "name") {
      this.products.sort((a, b) => a.Name.localeCompare(b.Name));
    } else if (criteria === "price-low") {
      this.products.sort((a, b) => a.FinalPrice - b.FinalPrice);
    } else if (criteria === "price-high") {
      this.products.sort((a, b) => b.FinalPrice - a.FinalPrice);
    }
  }

  setupSortListener() {
    const sortSelect = document.querySelector("#sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.sortProducts(e.target.value);
        this.renderList(this.products);
      });
    }
  }

  renderList(list) {
    this.listElement.innerHTML = "";
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }
}