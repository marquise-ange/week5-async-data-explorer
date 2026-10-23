
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

const colors = {
  field:
    'w-full rounded-xl border border-[#dfe4da] bg-white px-4 py-3 text-sm text-[#24382E] transition focus:border-[#789B80] focus:outline-none focus:ring-2 focus:ring-[#DCE9D8]',
  button:
    'rounded-xl bg-[#244B3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183629] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#789B80]',
}

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag)
  element.className = className

  if (text !== '') {
    element.textContent = text
  }

  return element
}

function createBrand() {
  const brand = createElement('div', 'flex items-center gap-3')

  const mark = createElement(
    'div',
    'grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#244B3B] text-xl text-white',
    '✳'
  )

  const words = createElement('div')

  const name = createElement(
    'p',
    'font-extrabold tracking-tight text-[#244B3B]',
    'Product Explorer'
  )

  const tagline = createElement(
    'p',
    'mt-0.5 text-xs text-[#718078]',
    'Discover something great'
  )

  words.append(name, tagline)
  brand.append(mark, words)

  return brand
}

function createHeader() {
  const header = createElement(
    'header',
    'flex items-center justify-between gap-4 border-b border-[#e6e9e1] py-5'
  )

  const label = createElement(
    'span',
    'hidden rounded-full border border-[#dce9d8] bg-white px-4 py-2 text-xs font-semibold text-[#244B3B] sm:inline-block',
    'YOUR PRODUCT GUIDE'
  )

  header.append(createBrand(), label)

  return header
}

function createHero() {
  const hero = createElement(
    'section',
    'relative mt-8 overflow-hidden rounded-[28px] border border-[#e0e8db] bg-gradient-to-br from-[#e8eee2] to-[#f1efe3] p-7 sm:p-10 lg:p-14'
  )

  const content = createElement(
    'div',
    'relative z-10 max-w-2xl'
  )

  const eyebrow = createElement(
    'p',
    'mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#446B51]',
    '✦  YOUR NEXT DISCOVERY STARTS HERE'
  )

  const heading = createElement(
    'h1',
    'max-w-xl text-4xl font-extrabold leading-tight tracking-[-0.055em] text-[#183629] sm:text-5xl lg:text-6xl',
    'Find your next favorite.'
  )

  const description = createElement(
    'p',
    'mt-5 max-w-lg text-sm leading-7 text-[#617166] sm:text-base',
    'Explore our collection, compare prices, and discover products that catch your eye.'
  )

  content.append(eyebrow, heading, description)

  const decoration = createElement(
    'div',
    'pointer-events-none absolute -bottom-24 -right-12 h-64 w-64 rounded-full border-[35px] border-[#244B3B]/[0.06] sm:h-80 sm:w-80'
  )

  hero.append(content, decoration)

  return hero
}

function createStatCard(label, value, note) {
  const card = createElement(
    'article',
    'rounded-2xl border border-[#e6e9e1] bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6'
  )

  const title = createElement(
    'p',
    'text-sm font-medium text-[#718078]',
    label
  )

  const number = createElement(
    'p',
    'mt-3 break-words text-2xl font-extrabold tracking-tight text-[#244B3B] sm:text-3xl',
    value
  )

  const description = createElement(
    'p',
    'mt-2 text-xs text-[#8a968e]',
    note
  )

  card.append(title, number, description)

  return card
}

function createStats() {
  const stats = createElement(
    'section',
    'mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4'
  )

  const total = state.items.length

  // Calculate the total of all valid numeric prices.
  const priceTotal = state.items.reduce(
    (sum, product) =>
      sum + (
        typeof product.price === 'number' &&
          Number.isFinite(product.price)
          ? product.price
          : 0
      ),
    0
  )

  // Count products that have valid numeric prices.
  const pricedProducts = state.items.reduce(
    (count, product) =>
      count + (
        typeof product.price === 'number' &&
          Number.isFinite(product.price)
          ? 1
          : 0
      ),
    0
  )

  // Divide by priced products, not all products.
  const averagePrice = pricedProducts > 0
    ? priceTotal / pricedProducts
    : 0

  const categories = new Set(
    state.items
      .map(({ category }) => category)
      .filter(Boolean)
  )

  stats.append(
    createStatCard(
      'Total products',
      total.toLocaleString(),
      'Products loaded from the API'
    ),
    createStatCard(
      'Average price',
      `$${averagePrice.toFixed(2)}`,
      'Average price of products with valid prices'
    ),
    createStatCard(
      'Categories',
      categories.size.toLocaleString(),
      'Unique product categories'
    ),
    createStatCard(
      'Products with prices',
      pricedProducts.toLocaleString(),
      'Products with a valid numeric price'
    )
  )

  return stats
}

function createProductCard({
  id,
  title,
  price,
  category,
  thumbnail,
  description,
  rating,
}) {
  const card = createElement(
    'article',
    'group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e9ebe5] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#d4dfd1] hover:shadow-xl'
  )

  const imageWrap = createElement(
    'div',
    'flex h-52 items-center justify-center overflow-hidden bg-[#f4f5ef] p-5'
  )

  const image = createElement(
    'img',
    'h-full w-full object-contain transition duration-300 group-hover:scale-105'
  )

  image.alt = title ?? 'Product image'
  image.loading = 'lazy'
  image.decoding = 'async'

  if (thumbnail) {
    image.src = thumbnail
  } else {
    image.hidden = true
  }

  image.addEventListener(
    'error',
    () => {
      image.hidden = true
      imageWrap.setAttribute(
        'aria-label',
        'Product image unavailable'
      )
    },
    { once: true }
  )

  imageWrap.append(image)

  const content = createElement(
    'div',
    'flex flex-1 flex-col items-start p-4 sm:p-5'
  )

  const categoryText = createElement(
    'span',
    'inline-block max-w-full truncate rounded-full bg-[#e8eee2] px-3 py-1.5 text-xs font-bold capitalize text-[#244B3B]',
    category ?? 'Uncategorized'
  )

  const name = createElement(
    'h2',
    'mt-4 line-clamp-2 min-h-12 text-base font-bold leading-6 text-[#24382E]',
    title ?? 'Untitled product'
  )

  const details = createElement(
    'p',
    'mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#718078]',
    description ?? 'No description available.'
  )

  const meta = createElement(
    'div',
    'mt-5 flex w-full items-center justify-between gap-2'
  )

  const priceText = createElement(
    'p',
    'text-xl font-extrabold tracking-tight text-[#244B3B]',
    typeof price === 'number'
      ? `$${price.toFixed(2)}`
      : 'Price unavailable'
  )

  meta.append(priceText)

  if (typeof rating?.rate === 'number') {
    const ratingText = createElement(
      'span',
      'shrink-0 text-sm font-semibold text-[#8a6925]',
      `★ ${rating.rate.toFixed(1)}`
    )

    meta.append(ratingText)
  }

  const idText = createElement(
    'p',
    'mt-3 text-xs text-[#8a968e]',
    `Product ID: ${id}`
  )

  content.append(
    categoryText,
    name,
    details,
    meta,
    idText
  )

  card.append(imageWrap, content)

  return card
}

function createStatePanel(title, message, icon = '✦') {
  const panel = createElement(
    'div',
    'col-span-full rounded-[22px] border border-dashed border-[#d5ded2] bg-white/80 px-6 py-12 text-center'
  )

  const symbol = createElement(
    'div',
    'mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#e8eee2] text-2xl text-[#244B3B]',
    icon
  )

  const heading = createElement(
    'h3',
    'text-lg font-bold text-[#183629]',
    title
  )

  const description = createElement(
    'p',
    'mx-auto mt-2 max-w-md text-sm leading-6 text-[#718078]',
    message
  )

  panel.append(symbol, heading, description)

  return panel
}

function createLoadingPage() {
  const page = createElement(
    'main',
    'mx-auto min-h-screen w-full max-w-[1180px] px-4 pb-16 sm:px-6 lg:px-8'
  )

  page.append(createHeader(), createHero())

  const loadingMessage = createElement(
    'p',
    'mt-8 text-sm text-[#718078]',
    'Loading your product collection...'
  )

  loadingMessage.setAttribute('role', 'status')
  loadingMessage.setAttribute('aria-live', 'polite')

  const skeletonGrid = createElement(
    'div',
    'mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  )

  for (let i = 0; i < 8; i += 1) {
    const skeleton = createElement(
      'div',
      'animate-pulse overflow-hidden rounded-[22px] border border-[#e6e9e1] bg-white'
    )

    const skeletonImage = createElement(
      'div',
      'h-52 bg-[#e8eae3]'
    )

    const skeletonContent = createElement(
      'div',
      'space-y-3 p-5'
    )

    skeletonContent.append(
      createElement('div', 'h-4 w-1/3 rounded-lg bg-[#e8eae3]'),
      createElement('div', 'h-5 w-4/5 rounded-lg bg-[#e8eae3]'),
      createElement('div', 'h-4 w-full rounded-lg bg-[#e8eae3]'),
      createElement('div', 'h-8 w-1/2 rounded-lg bg-[#e8eae3]')
    )

    skeleton.append(skeletonImage, skeletonContent)
    skeletonGrid.append(skeleton)
  }

  page.append(loadingMessage, skeletonGrid)

  return page
}

function createErrorPage() {
  const page = createElement(
    'main',
    'mx-auto min-h-screen w-full max-w-[1180px] px-4 pb-16 sm:px-6 lg:px-8'
  )

  page.append(createHeader(), createHero())

  const panel = createElement(
    'section',
    'mt-8 max-w-xl rounded-[22px] border border-[#e6e9e1] bg-white p-7 shadow-sm'
  )

  const heading = createElement(
    'h2',
    'text-xl font-bold text-[#183629]',
    'Unable to load products'
  )

  const message = createElement(
    'p',
    'mt-3 text-sm leading-6 text-[#718078]',
    state.error ?? 'Please check your connection and try again.'
  )

  message.setAttribute('role', 'alert')

  const retry = createElement(
    'button',
    colors.button,
    'Try again'
  )

  retry.type = 'button'
  retry.addEventListener('click', loadProducts)

  panel.append(heading, message, retry)
  page.append(panel)

  return page
}

function render() {
  app.replaceChildren()

  if (state.status === 'loading') {
    app.append(createLoadingPage())
    return
  }

  if (state.status === 'error') {
    app.append(createErrorPage())
    return
  }

  const page = createElement(
    'main',
    'mx-auto min-h-screen w-full max-w-[1180px] px-4 pb-12 sm:px-6 lg:px-8'
  )

  page.append(
    createHeader(),
    createHero(),
    createStats()
  )

  const catalogue = createElement('section', 'mt-12')

  const sectionHeading = createElement(
    'h2',
    'text-2xl font-extrabold tracking-tight text-[#183629] sm:text-3xl',
    'Explore the collection'
  )

  const sectionDescription = createElement(
    'p',
    'mt-2 text-sm leading-6 text-[#718078]',
    'Search, filter, and sort to find what you are looking for.'
  )

  catalogue.append(sectionHeading, sectionDescription)

  const toolbar = createElement(
    'div',
    'mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]'
  )

  const searchLabel = createElement(
    'label',
    'block text-sm font-semibold text-[#34483B]'
  )

  searchLabel.htmlFor = 'product-search'

  searchLabel.append(
    createElement('span', 'mb-2 block', 'Search products')
  )

  const searchInput = createElement('input', colors.field)

  searchInput.type = 'search'
  searchInput.id = 'product-search'
  searchInput.placeholder = 'Search by name or description...'
  searchInput.value = state.query
  searchInput.autocomplete = 'off'

  searchInput.setAttribute(
    'aria-label',
    'Search by product name or description'
  )

  searchInput.addEventListener('input', (event) => {
    const cursorPosition = event.target.selectionStart

    state.query = event.target.value
    render()

    const updatedSearch = document.querySelector(
      '#product-search'
    )

    if (updatedSearch) {
      updatedSearch.focus()

      if (cursorPosition !== null) {
        updatedSearch.setSelectionRange(
          cursorPosition,
          cursorPosition
        )
      }
    }
  })

  searchLabel.append(searchInput)

  const categories = [
    ...new Set(
      state.items
        .map(({ category }) => category)
        .filter(Boolean)
    ),
  ].toSorted((a, b) => a.localeCompare(b))

  const categoryLabel = createElement(
    'label',
    'block text-sm font-semibold text-[#34483B]'
  )

  categoryLabel.htmlFor = 'category-filter'

  categoryLabel.append(
    createElement('span', 'mb-2 block', 'Category')
  )

  const categorySelect = createElement('select', colors.field)

  categorySelect.id = 'category-filter'

  categorySelect.setAttribute(
    'aria-label',
    'Filter products by category'
  )

  const allOption = document.createElement('option')
  allOption.value = 'all'
  allOption.textContent = 'All categories'

  categorySelect.append(allOption)

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

  categoryLabel.append(categorySelect)

  const sortLabel = createElement(
    'label',
    'block text-sm font-semibold text-[#34483B]'
  )

  sortLabel.htmlFor = 'sort-products'

  sortLabel.append(
    createElement('span', 'mb-2 block', 'Sort by')
  )

  const sortSelect = createElement('select', colors.field)

  sortSelect.id = 'sort-products'

  sortSelect.setAttribute('aria-label', 'Sort products')

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

  sortLabel.append(sortSelect)

  toolbar.append(searchLabel, categoryLabel, sortLabel)

  const query = state.query.trim().toLowerCase()

  const visibleItems = state.items.filter((product) => {
    const title = (product.title ?? '').toLowerCase()
    const description = (product.description ?? '').toLowerCase()

    const matchesSearch =
      title.includes(query) || description.includes(query)

    const matchesCategory =
      state.filter === 'all' ||
      product.category === state.filter

    return matchesSearch && matchesCategory
  })

  let sortedItems = visibleItems

  if (state.sort === 'price-asc') {
    sortedItems = visibleItems.toSorted(
      (a, b) => (a.price ?? 0) - (b.price ?? 0)
    )
  } else if (state.sort === 'price-desc') {
    sortedItems = visibleItems.toSorted(
      (a, b) => (b.price ?? 0) - (a.price ?? 0)
    )
  } else if (state.sort === 'name-asc') {
    sortedItems = visibleItems.toSorted(
      (a, b) =>
        (a.title ?? '').localeCompare(b.title ?? '')
    )
  }

  const resultsRow = createElement(
    'div',
    'mt-6 flex flex-wrap items-center justify-between gap-3'
  )

  const results = createElement(
    'p',
    'text-sm text-[#718078]'
  )

  results.setAttribute('role', 'status')
  results.setAttribute('aria-live', 'polite')

  const resultsStrong = createElement(
    'span',
    'font-bold text-[#244B3B]',
    sortedItems.length.toLocaleString()
  )

  results.append(
    resultsStrong,
    document.createTextNode(
      ` of ${state.items.length.toLocaleString()} products`
    )
  )

  const activeFilters = createElement(
    'span',
    'rounded-full bg-[#e8eee2] px-3 py-1.5 text-xs font-semibold capitalize text-[#244B3B]',
    state.filter === 'all' ? 'All categories' : state.filter
  )

  resultsRow.append(results, activeFilters)

  const grid = createElement(
    'div',
    'mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  )

  grid.setAttribute('aria-label', 'Product catalogue')

  if (sortedItems.length === 0) {
    let message = 'No products are available right now.'

    if (state.query.trim() && state.filter !== 'all') {
      message =
        'No products match your search and selected category.'
    } else if (state.query.trim()) {
      message = 'No products found. Try another search.'
    } else if (state.filter !== 'all') {
      message = 'No products found in this category.'
    }

    grid.append(
      createStatePanel('No products found', message, '⌕')
    )
  } else {
    const cards = sortedItems.map((product) =>
      createProductCard(product)
    )

    grid.append(...cards)
  }

  catalogue.append(toolbar, resultsRow, grid)

  const footer = createElement(
    'footer',
    'mt-14 border-t border-[#e6e9e1] pt-6 text-center text-xs leading-6 text-[#718078]',
    'Product Explorer · Built with JavaScript, Vite and Tailwind CSS.'
  )

  page.append(catalogue, footer)
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

    state.error = error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'
  }

  render()
}

loadProducts()
