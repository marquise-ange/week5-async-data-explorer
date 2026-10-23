
import './style.css'
import { getProducts } from './api.js'

const state = {
  items: [],
  status: 'loading',
  error: null,
  query: '',
  filter: 'all',
  sort: 'default',
}

const app = document.querySelector('#app')

function render() {
  app.textContent = ''

  if (state.status === 'loading') {
    app.textContent = 'Loading products...'
    return
  }

  if (state.status === 'error') {
    app.textContent = `Error: ${state.error}`
    return
  }

  app.textContent = `Products loaded: ${state.items.length}`
}

async function loadProducts() {
  state.status = 'loading'
  state.error = null
  render()

  try {
    const { products } = await getProducts()

    state.items = products
    state.status = 'success'
  } catch (error) {
    state.status = 'error'
    state.error = error.message
  }

  render()
}

loadProducts()
