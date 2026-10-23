
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
  app.replaceChildren()

  if (state.status === 'loading') {
    app.innerHTML = `
      <main class="min-h-screen bg-stone-100 p-8">
        <h1 class="text-3xl font-bold text-green-700">
          Data Explorer
        </h1>

        <p role="status" aria-live="polite" class="mt-4 text-gray-600">
          Loading products, please wait...
        </p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div class="h-40 animate-pulse rounded-xl bg-gray-200"></div>
          <div class="h-40 animate-pulse rounded-xl bg-gray-200"></div>
          <div class="h-40 animate-pulse rounded-xl bg-gray-200"></div>
          <div class="h-40 animate-pulse rounded-xl bg-gray-200"></div>
        </div>
      </main>
    `
    return
  }

  if (state.status === 'error') {
    app.innerHTML = `
      <main class="min-h-screen bg-stone-100 p-8">
        <h1 class="text-3xl font-bold text-green-700">
          Data Explorer
        </h1>

        <section class="mt-8 max-w-lg rounded-xl bg-white p-6 shadow">
          <h2 class="text-xl font-semibold text-red-600">
            Unable to load products
          </h2>

          <p id="error-message" role="alert" class="mt-3 text-gray-600"></p>

          <button
            id="retry-button"
            type="button"
            class="mt-5 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Retry
          </button>
        </section>
      </main>
    `

    document.querySelector('#error-message').textContent = state.error

    document.querySelector('#retry-button').addEventListener(
      'click',
      loadProducts
    )

    return
  }

  app.innerHTML = `
    <main class="min-h-screen bg-stone-100 p-8">
      <h1 class="text-3xl font-bold text-green-700">
        Data Explorer
      </h1>

      <p role="status" aria-live="polite" class="mt-4 text-gray-600">
        Products loaded: ${state.items.length}
      </p>
    </main>
  `
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
