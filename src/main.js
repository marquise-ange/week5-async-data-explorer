
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

function createProductCard({
  id,
  title,
  price,
  category,
  thumbnail,
  description,
}) {
  const card = document.createElement('article')
  card.className =
    'overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200'

  const image = document.createElement('img')
  image.src = thumbnail ?? ''
  image.alt = title ?? 'Product image'
  image.loading = 'lazy'
  image.className = 'h-48 w-full bg-gray-100 object-contain p-4'

  const content = document.createElement('div')
  content.className = 'p-4'

  const categoryText = document.createElement('p')
  categoryText.className = 'text-sm capitalize text-green-700'
  categoryText.textContent = category ?? 'Uncategorized'

  const name = document.createElement('h2')
  name.className = 'mt-2 text-lg font-semibold text-gray-900'
  name.textContent = title ?? 'Untitled product'

  const details = document.createElement('p')
  details.className = 'mt-2 line-clamp-2 text-sm text-gray-600'
  details.textContent = description ?? 'No description available.'

  const priceText = document.createElement('p')
  priceText.className = 'mt-4 text-xl font-bold text-gray-900'
  priceText.textContent =
    typeof price === 'number' ? `$${price.toFixed(2)}` : 'Price unavailable'

  const idText = document.createElement('p')
  idText.className = 'mt-2 text-xs text-gray-500'
  idText.textContent = `Product ID: ${id}`

  content.append(categoryText, name, details, priceText, idText)
  card.append(image, content)

  return card
}

function render() {
  app.replaceChildren()

  if (state.status === 'loading') {
    app.innerHTML = `
      <main class="min-h-screen bg-stone-100 p-8">
        <h1 class="text-3xl font-bold text-green-700">Data Explorer</h1>
        <p role="status" aria-live="polite" class="mt-4 text-gray-600">
          Loading products, please wait...
        </p>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          ${Array.from({ length: 8 }, () =>
      '<div class="h-64 animate-pulse rounded-2xl bg-gray-200"></div>'
    ).join('')}
        </div>
      </main>
    `
    return
  }

  if (state.status === 'error') {
    app.innerHTML = `
      <main class="min-h-screen bg-stone-100 p-8">
        <h1 class="text-3xl font-bold text-green-700">Data Explorer</h1>
        <section class="mt-8 max-w-lg rounded-xl bg-white p-6 shadow">
          <h2 class="text-xl font-semibold text-red-600">
            Unable to load products
          </h2>
          <p id="error-message" role="alert" class="mt-3 text-gray-600"></p>
          <button id="retry-button" type="button"
            class="mt-5 rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800">
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

  const page = document.createElement('main')
  page.className = 'min-h-screen bg-stone-100 p-6 sm:p-8'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold text-green-700'
  heading.textContent = 'Data Explorer'

  const intro = document.createElement('p')
  intro.className = 'mt-2 text-gray-600'
  intro.textContent = 'Explore our product collection.'

  const status = document.createElement('p')
  status.className = 'mt-4 text-sm text-gray-600'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.textContent = `Products loaded: ${state.items.length}`

  const grid = document.createElement('section')
  grid.className =
    'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  grid.setAttribute('aria-label', 'Product catalogue')

  const cards = state.items.map(({
    id,
    title,
    price,
    category,
    thumbnail,
    description,
  }) =>
    createProductCard({
      id,
      title,
      price,
      category,
      thumbnail,
      description,
    })
  )

  grid.append(...cards)
  page.append(heading, intro, status, grid)
  app.append(page)
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
