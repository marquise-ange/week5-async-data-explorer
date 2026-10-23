
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

// Create one product card safely using DOM elements.
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
  image.alt = title ?? 'Product image'
  image.loading = 'lazy'
  image.className = 'h-48 w-full bg-gray-100 object-contain p-4'

  if (thumbnail) {
    image.src = thumbnail
  } else {
    image.alt = `${title ?? 'Product'} image unavailable`
  }

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

// Display the current application state.
function render() {
  app.replaceChildren()

  // Loading state
  if (state.status === 'loading') {
    const loadingPage = document.createElement('main')
    loadingPage.className = 'min-h-screen bg-stone-100 p-8'

    loadingPage.innerHTML = `
      <h1 class="text-3xl font-bold text-green-700">Data Explorer</h1>
      <p role="status" aria-live="polite" class="mt-4 text-gray-600">
        Loading products, please wait...
      </p>
      <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        ${Array.from(
      { length: 8 },
      () =>
        '<div class="h-64 animate-pulse rounded-2xl bg-gray-200"></div>'
    ).join('')}
      </div>
    `

    app.append(loadingPage)
    return
  }

  // Error state
  if (state.status === 'error') {
    const errorPage = document.createElement('main')
    errorPage.className = 'min-h-screen bg-stone-100 p-8'

    errorPage.innerHTML = `
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
    `

    errorPage.querySelector('#error-message').textContent =
      state.error ?? 'Please check your connection and try again.'

    errorPage.querySelector('#retry-button').addEventListener(
      'click',
      loadProducts
    )

    app.append(errorPage)
    return
  }

  // Main page
  const page = document.createElement('main')
  page.className = 'min-h-screen bg-stone-100 p-6 sm:p-8'

  const heading = document.createElement('h1')
  heading.className = 'text-3xl font-bold text-green-700'
  heading.textContent = 'Data Explorer'

  const intro = document.createElement('p')
  intro.className = 'mt-2 text-gray-600'
  intro.textContent = 'Explore our product collection.'

  // Search input
  const searchLabel = document.createElement('label')
  searchLabel.htmlFor = 'product-search'
  searchLabel.className = 'mt-5 block font-medium text-gray-700'
  searchLabel.textContent = 'Search products'

  const searchInput = document.createElement('input')
  searchInput.type = 'search'
  searchInput.id = 'product-search'
  searchInput.placeholder = 'Search by product name or description...'
  searchInput.setAttribute('aria-label', 'Search by product name or description')
  searchInput.value = state.query
  searchInput.className =
    'mt-2 w-full max-w-lg rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-200'

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value
    render()
  })

  // Search products by title or description.
  const query = state.query.trim().toLowerCase()

  const visibleItems = state.items.filter((product) => {
    const title = (product.title ?? '').toLowerCase()
    const description = (product.description ?? '').toLowerCase()

    return title.includes(query) || description.includes(query)
  })

  const status = document.createElement('p')
  status.className = 'mt-4 text-sm text-gray-600'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.textContent = `Showing ${visibleItems.length} of ${state.items.length} products`

  // Product grid
  const grid = document.createElement('section')
  grid.className =
    'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  grid.setAttribute('aria-label', 'Product catalogue')

  // Empty state or product cards
  if (visibleItems.length === 0) {
    const emptyMessage = document.createElement('p')
    emptyMessage.className =
      'col-span-full rounded-xl bg-white p-6 text-gray-600 shadow-sm'
    emptyMessage.textContent = state.query.trim()
      ? 'No products found. Try another search.'
      : 'No products are available right now.'

    grid.append(emptyMessage)
  } else {
    const cards = visibleItems.map(({
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
  }

  page.append(heading, intro, searchLabel, searchInput, status, grid)
  app.append(page)
}

// Fetch products from the API.
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

// Start the application.
loadProducts()
