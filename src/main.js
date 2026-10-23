
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

// Create a product card using safe DOM methods.
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

// Render the interface from the current state.
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

  // Search label
  const searchLabel = document.createElement('label')
  searchLabel.htmlFor = 'product-search'
  searchLabel.className = 'mt-5 block font-medium text-gray-700'
  searchLabel.textContent = 'Search products'

  // Search input
  const searchInput = document.createElement('input')
  searchInput.type = 'search'
  searchInput.id = 'product-search'
  searchInput.placeholder = 'Search by product name or description...'
  searchInput.setAttribute(
    'aria-label',
    'Search by product name or description'
  )
  searchInput.value = state.query
  searchInput.className =
    'mt-2 w-full max-w-lg rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-200'

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value
    render()
  })

  // Category label
  const categoryLabel = document.createElement('label')
  categoryLabel.htmlFor = 'category-filter'
  categoryLabel.className = 'mt-5 block font-medium text-gray-700'
  categoryLabel.textContent = 'Filter by category'

  // Category dropdown
  const categorySelect = document.createElement('select')
  categorySelect.id = 'category-filter'
  categorySelect.setAttribute(
    'aria-label',
    'Filter products by category'
  )
  categorySelect.className =
    'mt-2 block w-full max-w-lg rounded-xl border border-gray-300 bg-white px-4 py-3'

  const allOption = document.createElement('option')
  allOption.value = 'all'
  allOption.textContent = 'All categories'
  categorySelect.append(allOption)

  // Create unique categories from the loaded API data.
  const categories = [
    ...new Set(
      state.items
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ].sort()

  categories.forEach((category) => {
    const option = document.createElement('option')
    option.value = category
    option.textContent = category
    categorySelect.append(option)
  })

  categorySelect.value = categories.includes(state.filter)
    ? state.filter
    : 'all'

  categorySelect.addEventListener('change', (event) => {
    state.filter = event.target.value
    render()
  })

  // Filter products using both search and category.
  const query = state.query.trim().toLowerCase()

  const visibleItems = state.items.filter((product) => {
    const title = (product.title ?? '').toLowerCase()
    const description = (product.description ?? '').toLowerCase()

    const matchesSearch =
      title.includes(query) || description.includes(query)

    const matchesCategory =
      state.filter === 'all' || product.category === state.filter

    return matchesSearch && matchesCategory
  })

  // Sorting label
  const sortLabel = document.createElement('label')
  sortLabel.htmlFor = 'sort-products'
  sortLabel.className = 'mt-5 block font-medium text-gray-700'
  sortLabel.textContent = 'Sort products'

  // Sorting dropdown
  const sortSelect = document.createElement('select')
  sortSelect.id = 'sort-products'
  sortSelect.setAttribute('aria-label', 'Sort products')
  sortSelect.className =
    'mt-2 block w-full max-w-lg rounded-xl border border-gray-300 bg-white px-4 py-3'

  const sortOptions = [
    { value: 'default', label: 'Default order' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
  ]

  sortOptions.forEach(({ value, label }) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = label
    sortSelect.append(option)
  })

  sortSelect.value = state.sort

  sortSelect.addEventListener('change', (event) => {
    state.sort = event.target.value
    render()
  })

  // Sort a copy of the filtered products.
  let sortedItems = visibleItems

  if (state.sort === 'price-asc') {
    sortedItems = visibleItems.toSorted(
      (a, b) => a.price - b.price
    )
  } else if (state.sort === 'price-desc') {
    sortedItems = visibleItems.toSorted(
      (a, b) => b.price - a.price
    )
  } else if (state.sort === 'name-asc') {
    sortedItems = visibleItems.toSorted(
      (a, b) => a.title.localeCompare(b.title)
    )
  }

  // Results count
  const status = document.createElement('p')
  status.className = 'mt-4 text-sm text-gray-600'
  status.setAttribute('role', 'status')
  status.setAttribute('aria-live', 'polite')
  status.textContent =
    `Showing ${sortedItems.length} of ${state.items.length} products`

  // Product grid
  const grid = document.createElement('section')
  grid.className =
    'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  grid.setAttribute('aria-label', 'Product catalogue')

  // Empty state or sorted product cards
  if (sortedItems.length === 0) {
    const emptyMessage = document.createElement('p')
    emptyMessage.className =
      'col-span-full rounded-xl bg-white p-6 text-gray-600 shadow-sm'

    if (state.query.trim() && state.filter !== 'all') {
      emptyMessage.textContent =
        'No products match your search and selected category.'
    } else if (state.query.trim()) {
      emptyMessage.textContent =
        'No products found. Try another search.'
    } else if (state.filter !== 'all') {
      emptyMessage.textContent =
        'No products found in this category.'
    } else {
      emptyMessage.textContent =
        'No products are available right now.'
    }

    grid.append(emptyMessage)
  } else {
    const cards = sortedItems.map(({
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

  page.append(
    heading,
    intro,
    searchLabel,
    searchInput,
    categoryLabel,
    categorySelect,
    sortLabel,
    sortSelect,
    status,
    grid
  )

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
