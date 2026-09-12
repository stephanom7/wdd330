import { setLocalStorage, getLocalStorage } from './utils.mjs';
import ProductData from './ProductData.mjs';

const dataSource = new ProductData('tents');

function addProductToCart(product) {
  // 1. Obtener el carrito actual desde localStorage o inicializar un arreglo vacío si no hay datos
  let cart = getLocalStorage('so-cart');
  if (!Array.isArray(cart)) {
    cart = [];
  }

  // 2. Agregar el nuevo producto al arreglo
  cart.push(product);

  // 3. Guardar el arreglo actualizado
  setLocalStorage('so-cart', cart);
}

// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// add listener to Add to Cart button
document
  .getElementById('addToCart')
  .addEventListener('click', addToCartHandler);
