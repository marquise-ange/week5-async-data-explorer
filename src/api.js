
const BASE_URL = 'https://dummyjson.com'

export async function getJSON(url, options = {}) {
    const response = await fetch(url, options)

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

export async function getProducts() {
    return getJSON(`${BASE_URL}/products?limit=0`)
}

export async function getCategories() {
    return getJSON(`${BASE_URL}/products/categories`)
}

export async function getProduct(id) {
    return getJSON(`${BASE_URL}/products/${encodeURIComponent(id)}`)
}
