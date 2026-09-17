import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  // Limpia cualquier prefix tipo ../
  const imagePath = product.Image.replace(/^(\.\.\/|\/)+/, "");

  return `<li class="product-card">
    <a href="/product_pages/index.html?product=${product.Id}">
      <img src="/${imagePath}" alt="Image of ${product.Name}">
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
  }

  async init() {
    const list = await this.dataSource.getData();
    // Filtrar para mostrar solo los 4 productos que tienen imagen y requiere la actividad
    const filteredList = this.filterProducts(list);
    this.renderList(filteredList);
  }

  filterProducts(list) {
    const targetIds = ["880RR", "985RF", "985PR", "344YJ"];
    return list.filter((product) => targetIds.includes(product.Id));
  }

  renderList(list) {
    renderListWithTemplate(productCardTemplate, this.listElement, list);
  }
}