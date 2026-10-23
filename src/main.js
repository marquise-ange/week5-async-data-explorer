
import './style.css'
import {
  getProducts,
  getCategories,
  getProduct,
} from './api.js'
import { renderApp } from './render.js'

const app = document.querySelector('#app')

const FAVORITES_KEY = 'product-grove-favorites'
const PAGE_SIZE = 9

function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const state = {
  items: [],
  categories: [],
  status: 'loading',
  error: null,
  query: '',
  filter: 'all',
  sort: 'default',
  favorites: readFavorites(),
  favoritesOnly: false,
  visibleCount: PAGE_SIZE,
  selectedProductId: null,
  selectedProduct: null,
  detailStatus: 'idle',
  detailError: null,
}

function render() {
  renderApp(app, state, handlers)
}

function saveFavorites() {
  try {
    localStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(state.favorites)
    )
  } catch (error) {
    console.error('Could not save favorites:', error)
  }
}

function resetVisibleCount() {
  state.visibleCount = PAGE_SIZE
}

function clearFilters() {
  state.query = ''
  state.filter = 'all'
  state.sort = 'default'
  state.favoritesOnly = false
  resetVisibleCount()
  render()
}

const handlers = {
  onSearch(query) {
    state.query = query
    resetVisibleCount()
    render()
  },

  onFilter(category) {
    state.filter = category
    resetVisibleCount()
    render()
  },

  onSort(sort) {
    state.sort = sort
    resetVisibleCount()
    render()
  },

  onClearFilters() {
    clearFilters()
  },

  onToggleFavorites() {
    state.favoritesOnly = !state.favoritesOnly
    resetVisibleCount()
    render()
  },

  onToggleFavorite(id) {
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter(
        (favoriteId) => favoriteId !== id
      )
    } else {
      state.favorites = [...state.favorites, id]
    }

    saveFavorites()
    render()
  },

  onLoadMore() {
    state.visibleCount += PAGE_SIZE
    render()
  },

  onDetails(id) {
    openProductDetails(id)
  },

  onCloseDetails() {
    closeProductDetails()
  },

  onRetry() {
    loadProducts()
  },
}

async function loadProducts() {
  state.status = 'loading'
  state.error = null
  render()

  try {
    // Both requests start together instead of waiting for one another.
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getCategories(),
    ])

    if (!Array.isArray(productsData.products)) {
      throw new Error('The API returned an unexpected products response.')
    }

    state.items = productsData.products
    state.categories = Array.isArray(categoriesData)
      ? categoriesData
      : []

    // Remove favorite IDs that no longer exist in the loaded collection.
    const validIds = new Set(state.items.map((product) => product.id))
    state.favorites = state.favorites.filter((id) => validIds.has(id))
    saveFavorites()

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

async function openProductDetails(id) {
  state.selectedProductId = id
  state.selectedProduct = null
  state.detailStatus = 'loading'
  state.detailError = null
  render()

  try {
    const product = await getProduct(id)

    // Ignore the response if another product has since been selected.
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

function closeProductDetails() {
  state.selectedProductId = null
  state.selectedProduct = null
  state.detailStatus = 'idle'
  state.detailError = null
  render()
}

document.addEventListener('keydown', (event) => {
  if (
    event.key === 'Escape' &&
    state.selectedProductId !== null
  ) {
    closeProductDetails()
  }
})

render()
loadProducts()
