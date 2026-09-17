import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

// 1. Instanciamos la clase con los datos de las carpas ("tents")
const dataSource = new ProductData("tents");

// 2. Buscamos en el HTML la lista <ul> vacía
const listElement = document.querySelector(".product-list");

// 3. Creamos e inicializamos la lista para que renderice los productos
const productList = new ProductList("tents", dataSource, listElement);
productList.init();