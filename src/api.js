
const BASE_URL = 'https://dummyjson.com'
export async function getJSON(url) {
    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`)
    }

    return response.json()
}

export const getProducts = () =>
    getJSON(`${BASE_URL}/products?limit=100`)

export const getProduct = (id) =>
    getJSON(`${BASE_URL}/products/${id}`)

export const getCategories = () =>
    getJSON(`${BASE_URL}/products/categories`)
