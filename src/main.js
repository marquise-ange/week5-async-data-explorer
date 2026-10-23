
import './style.css'
import { getProducts, getCategories, getProduct } from './api.js'

const app = document.querySelector('#app')

const state = {
  items: [],
  categories: [],
  status: 'loading',
  error: null,
  query: '',
  filter: 'all',
  sort: 'default',
  selectedProductId: null,
  selectedProduct: null,
  detailStatus: 'idle',
  detailError: null,
}

const colors = {
  forest: '#244b3b',
  cream: '#f7f6ef',
  muted: '#718077',
}

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag)

  if (className) element.className = className
  if (text !== '') element.textContent = text

  return element
}

function createButton(text, className, onClick) {
  const button = createElement('button', className, text)
  button.type = 'button'
  button.addEventListener('click', onClick)
  return button
}

function formatPrice(price) {
  return typeof price === 'number' && Number.isFinite(price)
    ? `$${price.toFixed(2)}`
    : 'Price unavailable'
}

function getVisibleItems(currentState) {
  const query = currentState.query.trim().toLowerCase()

  let visibleItems = currentState.items.filter((product) => {
    const matchesQuery =
      !query ||
      product.title?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)

    const matchesCategory =
      currentState.filter === 'all' ||
      product.category === currentState.filter

    return matchesQuery && matchesCategory
  })

  if (currentState.sort === 'price-asc') {
    visibleItems = visibleItems.toSorted(
      (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
    )
  } else if (currentState.sort === 'price-desc') {
    visibleItems = visibleItems.toSorted(
      (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity)
    )
  } else if (currentState.sort === 'name-asc') {
    visibleItems = visibleItems.toSorted((a, b) =>
      (a.title ?? '').localeCompare(b.title ?? '')
    )
  }

  return visibleItems
}

function createBrand() {
  const brand = createElement(
    'a',
    'flex items-center gap-3 font-bold tracking-tight text-[#244b3b] no-underline'
  )
  brand.href = '#'
  brand.setAttribute('aria-label', 'Product Grove home')

  const mark = createElement(
    'span',
    'flex h-10 w-10 items-center justify-center rounded-2xl bg-[#244b3b] text-lg text-white',
    'G'
  )
  const words = createElement('span', 'text-lg', 'Product Grove')

  brand.append(mark, words)
  brand.addEventListener('click', (event) => {
    event.preventDefault()
    state.query = ''
    state.filter = 'all'
    state.sort = 'default'
    render()
  })

  return brand
}

function createHeader() {
  const header = createElement(
    'header',
    'border-b border-[#e4e6dc] bg-[#fffef9]'
  )
  const inner = createElement(
    'div',
    'mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8'
  )

  inner.append(createBrand())

  const label = createElement(
    'span',
    'hidden rounded-full bg-[#edf2e9] px-4 py-2 text-sm font-medium text-[#244b3b] sm:inline-flex',
    'Async Data Explorer'
  )

  inner.append(label)
  header.append(inner)
  return header
}

function createHero() {
  const hero = createElement(
    'section',
    'rounded-3xl bg-[#244b3b] px-6 py-8 text-white sm:px-10 sm:py-10'
  )

  const eyebrow = createElement(
    'p',
    'mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c6d9c7]',
    'DISCOVER SOMETHING USEFUL'
  )
  const heading = createElement(
    'h1',
    'max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl',
    'Find the products that fit your world.'
  )
  const description = createElement(
    'p',
    'mt-4 max-w-2xl text-sm leading-7 text-[#e1e9df] sm:text-base',
    'Explore a live product collection. Search, compare prices, and open any item to see more details.'
  )

  hero.append(eyebrow, heading, description)
  return hero
}

function createStatCard(label, value, description) {
  const card = createElement(
    'article',
    'rounded-2xl border border-[#e5e7dd] bg-white p-5'
  )
  const labelElement = createElement(
    'p',
    'text-sm font-medium text-[#718077]',
    label
  )
  const valueElement = createElement(
    'p',
    'mt-2 text-2xl font-semibold tracking-tight text-[#244b3b]',
    value
  )
  const descriptionElement = createElement(
    'p',
    'mt-2 text-xs leading-5 text-[#718077]',
    description
  )

  card.append(labelElement, valueElement, descriptionElement)
  return card
}

function createStats() {
  const stats = createElement(
    'section',
    'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'
  )
  stats.setAttribute('aria-label', 'Product statistics')

  const total = state.items.length

  const priceTotal = state.items.reduce(
    (sum, product) =>
      sum +
      (typeof product.price === 'number' &&
        Number.isFinite(product.price)
        ? product.price
        : 0),
    0
  )

  const pricedProducts = state.items.reduce(
    (count, product) =>
      count +
      (typeof product.price === 'number' &&
        Number.isFinite(product.price)
        ? 1
        : 0),
    0
  )

  const averagePrice =
    pricedProducts > 0 ? priceTotal / pricedProducts : 0

  const uniqueCategories = new Set(
    state.items.map((product) => product.category).filter(Boolean)
  )

  stats.append(
    createStatCard(
      'Total products',
      total.toLocaleString(),
      'Products loaded from the API'
    ),
    createStatCard(
      'Average price',
      formatPrice(averagePrice),
      'Average of products with a valid price'
    ),
    createStatCard(
      'Categories',
      uniqueCategories.size.toLocaleString(),
      'Unique product categories'
    ),
    createStatCard(
      'Products with prices',
      pricedProducts.toLocaleString(),
      'Products with valid price data'
    )
  )

  return stats
}

function createProductCard(product) {
  const card = createElement(
    'article',
    'flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7dd] bg-white transition hover:-translate-y-1 hover:shadow-lg'
  )

  const imageArea = createElement(
    'div',
    'flex h-52 items-center justify-center bg-[#f1f2e9] p-5'
  )

  if (product.thumbnail) {
    const image = createElement(
      'img',
      'h-full w-full object-contain'
    )
    image.src = product.thumbnail
    image.alt = product.title || 'Product image'
    image.loading = 'lazy'
    image.addEventListener('error', () => {
      image.remove()
      imageArea.textContent = 'Image unavailable'
      imageArea.classList.add('text-sm', 'text-[#718077]')
    })
    imageArea.append(image)
  } else {
    imageArea.textContent = 'Image unavailable'
    imageArea.classList.add('text-sm', 'text-[#718077]')
  }

  const content = createElement(
    'div',
    'flex flex-1 flex-col p-5'
  )

  const category = createElement(
    'p',
    'text-xs font-semibold uppercase tracking-wider text-[#6d806e]',
    product.category || 'Uncategorized'
  )

  const title = createElement(
    'h3',
    'mt-2 text-lg font-semibold leading-snug text-[#244b3b]',
    product.title || 'Untitled product'
  )

  const description = createElement(
    'p',
    'mt-2 line-clamp-3 text-sm leading-6 text-[#718077]',
    product.description || 'No description available.'
  )

  const priceRow = createElement(
    'div',
    'mt-4 flex items-center justify-between gap-3'
  )
  const price = createElement(
    'p',
    'text-xl font-bold text-[#244b3b]',
    formatPrice(product.price)
  )

  const ratingText =
    typeof product.rating === 'number'
      ? `★ ${product.rating.toFixed(1)}`
      : 'No rating'

  const rating = createElement(
    'span',
    'rounded-full bg-[#f4f0df] px-3 py-1 text-sm font-medium text-[#755d23]',
    ratingText
  )

  priceRow.append(price, rating)

  const detailsButton = createButton(
    'View details',
    'mt-5 w-full rounded-xl bg-[#244b3b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18382b]',
    () => openProductDetails(product.id)
  )

  detailsButton.setAttribute(
    'aria-label',
    `View details for ${product.title || 'this product'}`
  )

  content.append(category, title, description, priceRow, detailsButton)
  card.append(imageArea, content)

  return card
}

function createStatePanel(title, description) {
  const panel = createElement(
    'div',
    'col-span-full rounded-2xl border border-dashed border-[#d6dccf] bg-white px-6 py-12 text-center'
  )

  const heading = createElement(
    'h3',
    'text-lg font-semibold text-[#244b3b]',
    title
  )
  const message = createElement(
    'p',
    'mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718077]',
    description
  )

  panel.append(heading, message)
  return panel
}

function createLoadingPage() {
  const page = createElement('main', 'mx-auto max-w-7xl px-5 py-8 sm:px-8')
  page.setAttribute('aria-busy', 'true')

  page.append(createHero())

  const loadingMessage = createElement(
    'p',
    'mt-8 text-sm font-medium text-[#718077]',
    'Loading products and categories…'
  )
  loadingMessage.setAttribute('role', 'status')
  loadingMessage.setAttribute('aria-live', 'polite')
  page.append(loadingMessage)

  const skeletonGrid = createElement(
    'div',
    'mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
  )

  for (let index = 0; index < 6; index += 1) {
    const skeleton = createElement(
      'div',
      'animate-pulse overflow-hidden rounded-2xl border border-[#e5e7dd] bg-white'
    )
    const image = createElement('div', 'h-48 bg-[#e9ece2]')
    const lines = createElement('div', 'space-y-3 p-5')
    lines.append(
      createElement('div', 'h-3 w-1/3 rounded bg-[#e9ece2]'),
      createElement('div', 'h-5 w-4/5 rounded bg-[#e9ece2]'),
      createElement('div', 'h-3 w-full rounded bg-[#e9ece2]'),
      createElement('div', 'h-3 w-2/3 rounded bg-[#e9ece2]')
    )
    skeleton.append(image, lines)
    skeletonGrid.append(skeleton)
  }

  page.append(skeletonGrid)
  return page
}

function createErrorPage() {
  const page = createElement('main', 'mx-auto max-w-7xl px-5 py-8 sm:px-8')
  page.append(createHero())

  const panel = createElement(
    'section',
    'mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center'
  )
  panel.setAttribute('role', 'alert')

  panel.append(
    createElement(
      'h2',
      'text-xl font-semibold text-[#244b3b]',
      'We could not load the products.'
    ),
    createElement(
      'p',
      'mt-3 text-sm leading-6 text-[#718077]',
      state.error || 'Something went wrong. Please try again.'
    ),
    createButton(
      'Try again',
      'mt-5 rounded-xl bg-[#244b3b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#18382b]',
      loadProducts
    )
  )

  page.append(panel)
  return page
}

function createToolbar() {
  const toolbar = createElement(
    'section',
    'mt-8 rounded-2xl border border-[#e5e7dd] bg-white p-4 sm:p-5'
  )

  const heading = createElement(
    'div',
    'mb-4'
  )
  heading.append(
    createElement(
      'h2',
      'text-lg font-semibold text-[#244b3b]',
      'Explore the collection'
    ),
    createElement(
      'p',
      'mt-1 text-sm text-[#718077]',
      'Search, filter, and sort the products.'
    )
  )

  const controls = createElement(
    'div',
    'grid grid-cols-1 gap-3 md:grid-cols-3'
  )

  const searchLabel = createElement(
    'label',
    'block text-sm font-medium text-[#52645a]',
    'Search products'
  )
  const searchInput = createElement(
    'input',
    'mt-2 w-full rounded-xl border border-[#dce1d6] bg-[#fffef9] px-4 py-3 text-sm text-[#24382e]'
  )
  searchInput.type = 'search'
  searchInput.placeholder = 'Search by name or description…'
  searchInput.value = state.query
  searchInput.setAttribute('aria-label', 'Search products')
  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value
    const cursorPosition = event.target.selectionStart
    render()

    const newSearch = app.querySelector('input[type="search"]')
    if (newSearch) {
      newSearch.focus()
      newSearch.setSelectionRange(cursorPosition, cursorPosition)
    }
  })
  searchLabel.append(searchInput)

  const categoryLabel = createElement(
    'label',
    'block text-sm font-medium text-[#52645a]',
    'Category'
  )
  const categorySelect = createElement(
    'select',
    'mt-2 w-full rounded-xl border border-[#dce1d6] bg-[#fffef9] px-4 py-3 text-sm text-[#24382e]'
  )
  categorySelect.setAttribute('aria-label', 'Filter by category')

  const allOption = createElement('option', '', 'All categories')
  allOption.value = 'all'
  categorySelect.append(allOption)

  const categoryNames = state.categories.length
    ? state.categories
    : [...new Set(state.items.map((item) => item.category).filter(Boolean))]
      .toSorted((a, b) => a.localeCompare(b))

  categoryNames.forEach((category) => {
    const option = createElement(
      'option',
      '',
      typeof category === 'string'
        ? category
        : category.name || category.slug
    )
    option.value =
      typeof category === 'string'
        ? category
        : category.slug || category.name
    categorySelect.append(option)
  })

  categorySelect.value = state.filter
  categorySelect.addEventListener('change', (event) => {
    state.filter = event.target.value
    render()
  })
  categoryLabel.append(categorySelect)

  const sortLabel = createElement(
    'label',
    'block text-sm font-medium text-[#52645a]',
    'Sort by'
  )
  const sortSelect = createElement(
    'select',
    'mt-2 w-full rounded-xl border border-[#dce1d6] bg-[#fffef9] px-4 py-3 text-sm text-[#24382e]'
  )
  sortSelect.setAttribute('aria-label', 'Sort products')

  const sortOptions = [
    ['default', 'Default order'],
    ['price-asc', 'Price: Low to High'],
    ['price-desc', 'Price: High to Low'],
    ['name-asc', 'Name: A to Z'],
  ]

  sortOptions.forEach(([value, labelText]) => {
    const option = createElement('option', '', labelText)
    option.value = value
    sortSelect.append(option)
  })

  sortSelect.value = state.sort
  sortSelect.addEventListener('change', (event) => {
    state.sort = event.target.value
    render()
  })
  sortLabel.append(sortSelect)

  controls.append(searchLabel, categoryLabel, sortLabel)
  toolbar.append(heading, controls)
  return toolbar
}

function createProductGrid() {
  const section = createElement('section', 'mt-8')

  const visibleItems = getVisibleItems(state)
  const headingRow = createElement(
    'div',
    'mb-4 flex flex-wrap items-center justify-between gap-3'
  )

  headingRow.append(
    createElement(
      'h2',
      'text-xl font-semibold text-[#244b3b]',
      'Products'
    )
  )

  const count = createElement(
    'p',
    'text-sm text-[#718077]',
    `${visibleItems.length} of ${state.items.length} products`
  )
  count.setAttribute('role', 'status')
  count.setAttribute('aria-live', 'polite')
  headingRow.append(count)

  const grid = createElement(
    'div',
    'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
  )

  if (visibleItems.length === 0) {
    const emptyPanel = createStatePanel(
      'No products found',
      'Try a different search term or choose another category.'
    )

    emptyPanel.append(
      createButton(
        'Clear search and filters',
        'mt-5 rounded-xl border border-[#dce1d6] px-4 py-2 text-sm font-semibold text-[#244b3b] hover:bg-[#f1f2e9]',
        () => {
          state.query = ''
          state.filter = 'all'
          render()
        }
      )
    )

    grid.append(emptyPanel)
  } else {
    visibleItems.forEach((product) => {
      grid.append(createProductCard(product))
    })
  }

  section.append(headingRow, grid)
  return section
}

function createProductPage() {
  const page = createElement(
    'main',
    'mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8 sm:py-10'
  )

  page.append(
    createHero(),
    createStats(),
    createToolbar(),
    createProductGrid()
  )

  return page
}

function createDetailModal() {
  if (state.selectedProductId === null) return null

  const overlay = createElement(
    'div',
    'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251d]/70 p-4 sm:p-6'
  )
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeProductDetails()
  })

  const dialog = createElement(
    'section',
    'relative my-auto w-full max-w-3xl rounded-3xl bg-[#fffef9] p-5 shadow-2xl sm:p-8'
  )
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-labelledby', 'product-detail-title')

  const closeButton = createButton(
    'Close',
    'ml-auto block rounded-xl border border-[#dce1d6] px-4 py-2 text-sm font-semibold text-[#244b3b] hover:bg-[#f1f2e9]',
    closeProductDetails
  )
  closeButton.setAttribute('aria-label', 'Close product details')
  dialog.append(closeButton)

  if (state.detailStatus === 'loading') {
    const loading = createStatePanel(
      'Loading product details…',
      'We are fetching the latest information for this product.'
    )
    loading.classList.add('mt-4')
    loading.setAttribute('role', 'status')
    loading.setAttribute('aria-live', 'polite')
    dialog.append(loading)
  } else if (state.detailStatus === 'error') {
    const errorPanel = createStatePanel(
      'Details could not be loaded',
      state.detailError || 'Please try again.'
    )
    errorPanel.classList.add('mt-4')

    errorPanel.append(
      createButton(
        'Try again',
        'mt-5 rounded-xl bg-[#244b3b] px-5 py-3 text-sm font-semibold text-white',
        () => openProductDetails(state.selectedProductId)
      )
    )
    dialog.append(errorPanel)
  } else if (state.selectedProduct) {
    const product = state.selectedProduct
    const content = createElement(
      'div',
      'mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2'
    )

    const imageBox = createElement(
      'div',
      'flex min-h-64 items-center justify-center rounded-2xl bg-[#f1f2e9] p-6'
    )

    if (product.thumbnail) {
      const image = createElement(
        'img',
        'max-h-80 w-full object-contain'
      )
      image.src = product.thumbnail
      image.alt = product.title || 'Product image'
      image.addEventListener('error', () => {
        image.remove()
        imageBox.textContent = 'Image unavailable'
      })
      imageBox.append(image)
    } else {
      imageBox.textContent = 'Image unavailable'
    }

    const details = createElement('div', 'flex flex-col')
    details.append(
      createElement(
        'p',
        'text-xs font-bold uppercase tracking-widest text-[#718077]',
        product.category || 'Uncategorized'
      ),
      createElement(
        'h2',
        'mt-2 text-2xl font-semibold leading-tight text-[#244b3b] sm:text-3xl',
        product.title || 'Untitled product'
      ),
      createElement(
        'p',
        'mt-4 text-2xl font-bold text-[#244b3b]',
        formatPrice(product.price)
      ),
      createElement(
        'p',
        'mt-4 text-sm leading-7 text-[#52645a]',
        product.description || 'No description available.'
      )
    )

    const rating = createElement(
      'p',
      'mt-4 text-sm font-medium text-[#755d23]',
      typeof product.rating === 'number'
        ? `★ ${product.rating.toFixed(1)} rating`
        : 'Rating unavailable'
    )

    const stock = createElement(
      'p',
      'mt-2 text-sm text-[#52645a]',
      typeof product.stock === 'number'
        ? `Stock: ${product.stock}`
        : 'Stock information unavailable'
    )

    const brand = createElement(
      'p',
      'mt-2 text-sm text-[#52645a]',
      product.brand ? `Brand: ${product.brand}` : 'Brand unavailable'
    )

    const productId = createElement(
      'p',
      'mt-2 text-xs text-[#718077]',
      `Product ID: ${product.id}`
    )

    details.append(rating, stock, brand, productId)
    content.append(imageBox, details)
    dialog.append(content)
  }

  overlay.append(dialog)
  return overlay
}

function closeProductDetails() {
  state.selectedProductId = null
  state.selectedProduct = null
  state.detailStatus = 'idle'
  state.detailError = null
  render()
}

async function openProductDetails(id) {
  state.selectedProductId = id
  state.selectedProduct = null
  state.detailStatus = 'loading'
  state.detailError = null
  render()

  try {
    const product = await getProduct(id)

    // Ignore an older response if the user opened another product.
    if (state.selectedProductId !== id) return

    state.selectedProduct = product
    state.detailStatus = 'success'
  } catch (error) {
    if (state.selectedProductId !== id) return

    state.detailStatus = 'error'
    state.detailError =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred.'
  }

  render()
}

function render() {
  app.replaceChildren()

  const header = createHeader()
  app.append(header)

  if (state.status === 'loading') {
    app.append(createLoadingPage())
    return
  }

  if (state.status === 'error') {
    app.append(createErrorPage())
    return
  }

  app.append(createProductPage())

  const modal = createDetailModal()
  if (modal) app.append(modal)
}

async function loadProducts() {
  state.status = 'loading'
  state.error = null
  render()

  try {
    // Fetch products and categories concurrently.
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories(),
    ])

    state.items = Array.isArray(productsData.products)
      ? productsData.products
      : []

    state.categories = Array.isArray(categoriesData)
      ? categoriesData
      : []

    state.status = 'success'
  } catch (error) {
    state.status = 'error'
    state.error =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred.'
  }

  render()
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && state.selectedProductId !== null) {
    closeProductDetails()
  }
})

render()
loadProducts()
