
function el(tag, className = '', text = '') {
    const node = document.createElement(tag)

    if (className) node.className = className
    if (text !== '') node.textContent = text

    return node
}

function button(text, className, onClick) {
    const node = el('button', className, text)
    node.type = 'button'
    node.addEventListener('click', onClick)
    return node
}

function priceText(price) {
    return typeof price === 'number' && Number.isFinite(price)
        ? `$${price.toFixed(2)}`
        : 'Price unavailable'
}

export function getVisibleItems(state) {
    const query = state.query.trim().toLowerCase()

    let items = state.items.filter((product) => {
        const matchesQuery =
            !query ||
            product.title?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)

        const matchesCategory =
            state.filter === 'all' || product.category === state.filter

        const matchesFavorites =
            !state.favoritesOnly || state.favorites.includes(product.id)

        return matchesQuery && matchesCategory && matchesFavorites
    })

    if (state.sort === 'price-asc') {
        items = items.toSorted(
            (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)
        )
    } else if (state.sort === 'price-desc') {
        items = items.toSorted(
            (a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity)
        )
    } else if (state.sort === 'name-asc') {
        items = items.toSorted((a, b) =>
            (a.title ?? '').localeCompare(b.title ?? '')
        )
    }

    return items
}

function createHeader() {
    const header = el(
        'header',
        'border-b border-[#e4e6dc] bg-[#fffef9]'
    )
    const inner = el(
        'div',
        'mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8'
    )

    const brand = el(
        'a',
        'flex items-center gap-3 font-bold tracking-tight text-[#244b3b] no-underline'
    )
    brand.href = '#top'
    brand.setAttribute('aria-label', 'Product Grove home')

    const mark = el(
        'span',
        'flex h-10 w-10 items-center justify-center rounded-2xl bg-[#244b3b] text-lg text-white',
        'G'
    )
    const name = el('span', 'text-lg', 'Product Grove')

    brand.append(mark, name)

    inner.append(
        brand,
        el(
            'span',
            'hidden rounded-full bg-[#edf2e9] px-4 py-2 text-sm font-medium text-[#244b3b] sm:inline-flex',
            'Async Data Explorer'
        )
    )

    header.append(inner)
    return header
}

function createHero() {
    const hero = el(
        'section',
        'rounded-3xl bg-[#244b3b] px-6 py-8 text-white sm:px-10 sm:py-10'
    )

    hero.append(
        el(
            'p',
            'mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#c6d9c7]',
            'DISCOVER SOMETHING USEFUL'
        ),
        el(
            'h1',
            'max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl',
            'Find the products that fit your world.'
        ),
        el(
            'p',
            'mt-4 max-w-2xl text-sm leading-7 text-[#e1e9df] sm:text-base',
            'Explore a live product collection. Search, compare prices, save favorites, and open any item to learn more.'
        )
    )

    return hero
}

function createStatCard(label, value, description) {
    const card = el(
        'article',
        'rounded-2xl border border-[#e5e7dd] bg-white p-5'
    )

    card.append(
        el('p', 'text-sm font-medium text-[#718077]', label),
        el(
            'p',
            'mt-2 text-2xl font-semibold tracking-tight text-[#244b3b]',
            value
        ),
        el('p', 'mt-2 text-xs leading-5 text-[#718077]', description)
    )

    return card
}

function createStats(state) {
    const stats = el(
        'section',
        'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'
    )
    stats.setAttribute('aria-label', 'Product statistics')

    const priceTotal = state.items.reduce(
        (sum, product) =>
            sum +
            (typeof product.price === 'number' &&
                Number.isFinite(product.price)
                ? product.price
                : 0),
        0
    )

    const pricedCount = state.items.reduce(
        (count, product) =>
            count +
            (typeof product.price === 'number' &&
                Number.isFinite(product.price)
                ? 1
                : 0),
        0
    )

    const averagePrice = pricedCount ? priceTotal / pricedCount : 0

    const categories = new Set(
        state.items.map((product) => product.category).filter(Boolean)
    )

    stats.append(
        createStatCard(
            'Total products',
            state.items.length.toLocaleString(),
            'Products we have in Stock'
        ),
        createStatCard(
            'Average price',
            priceText(averagePrice),
            'Average of valid listed prices'
        ),
        createStatCard(
            'Categories',
            categories.size.toLocaleString(),
            'Unique product categories'
        ),
        createStatCard(
            'Favorites',
            state.favorites.length.toLocaleString(),
            'Products saved in this browser'
        )
    )

    return stats
}

function createToolbar(state, handlers) {
    const toolbar = el(
        'section',
        'mt-8 rounded-2xl border border-[#e5e7dd] bg-white p-4 sm:p-5'
    )

    toolbar.append(
        el('h2', 'text-lg font-semibold text-[#244b3b]', 'Explore the collection'),
        el(
            'p',
            'mt-1 text-sm text-[#718077]',
            'Search, filter, sort, or show your saved favorites.'
        )
    )

    const controls = el('div', 'mt-4 grid grid-cols-1 gap-3 md:grid-cols-3')

    const searchLabel = el(
        'label',
        'block text-sm font-medium text-[#52645a]',
        'Search products'
    )
    const search = el(
        'input',
        'mt-2 w-full rounded-xl border border-[#dce1d6] bg-[#fffef9] px-4 py-3 text-sm text-[#24382e]'
    )
    search.type = 'search'
    search.dataset.search = 'true'
    search.placeholder = 'Search name, description, or category…'
    search.value = state.query
    search.setAttribute('aria-label', 'Search products')
    search.addEventListener('input', (event) =>
        handlers.onSearch(event.target.value)
    )
    searchLabel.append(search)

    const categoryLabel = el(
        'label',
        'block text-sm font-medium text-[#52645a]',
        'Category'
    )
    const category = el(
        'select',
        'mt-2 w-full rounded-xl border border-[#dce1d6] bg-[#fffef9] px-4 py-3 text-sm text-[#24382e]'
    )
    category.setAttribute('aria-label', 'Filter by category')

    const allOption = el('option', '', 'All categories')
    allOption.value = 'all'
    category.append(allOption)

    state.categories.forEach((item) => {
        const value = typeof item === 'string' ? item : item.slug || item.name
        const label = typeof item === 'string' ? item : item.name || item.slug
        const option = el('option', '', label)
        option.value = value
        category.append(option)
    })

    category.value = state.filter
    category.addEventListener('change', (event) =>
        handlers.onFilter(event.target.value)
    )
    categoryLabel.append(category)

    const sortLabel = el(
        'label',
        'block text-sm font-medium text-[#52645a]',
        'Sort by'
    )
    const sort = el(
        'select',
        'mt-2 w-full rounded-xl border border-[#dce1d6] bg-[#fffef9] px-4 py-3 text-sm text-[#24382e]'
    )
    sort.setAttribute('aria-label', 'Sort products')

    const options = [
        ['default', 'Default order'],
        ['price-asc', 'Price: Low to High'],
        ['price-desc', 'Price: High to Low'],
        ['name-asc', 'Name: A to Z'],
    ]

    options.forEach(([value, label]) => {
        const option = el('option', '', label)
        option.value = value
        sort.append(option)
    })

    sort.value = state.sort
    sort.addEventListener('change', (event) =>
        handlers.onSort(event.target.value)
    )
    sortLabel.append(sort)

    controls.append(searchLabel, categoryLabel, sortLabel)

    const favoritesRow = el(
        'div',
        'mt-4 flex flex-wrap items-center justify-between gap-3'
    )
    const favoritesButton = button(
        state.favoritesOnly ? 'Show all products' : 'Show favorites only',
        'rounded-xl border border-[#dce1d6] px-4 py-2 text-sm font-semibold text-[#244b3b] hover:bg-[#f1f2e9]',
        handlers.onToggleFavorites
    )
    favoritesButton.setAttribute(
        'aria-pressed',
        String(state.favoritesOnly)
    )

    favoritesRow.append(
        favoritesButton,
        el(
            'p',
            'text-xs text-[#718077]',
            'Favorites are saved in your browser.'
        )
    )

    toolbar.append(controls, favoritesRow)
    return toolbar
}

function createProductCard(product, state, handlers) {
    const card = el(
        'article',
        'flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7dd] bg-white transition hover:-translate-y-1 hover:shadow-lg'
    )

    const imageArea = el(
        'div',
        'flex h-52 items-center justify-center bg-[#f1f2e9] p-5'
    )

    if (product.thumbnail) {
        const image = el('img', 'h-full w-full object-contain')
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

    const content = el('div', 'flex flex-1 flex-col p-5')
    const favorite = state.favorites.includes(product.id)

    const favoriteButton = button(
        favorite ? '♥ Saved' : '♡ Save favorite',
        'self-start rounded-full border border-[#dce1d6] px-3 py-1 text-xs font-semibold text-[#244b3b] hover:bg-[#edf2e9]',
        () => handlers.onToggleFavorite(product.id)
    )
    favoriteButton.setAttribute('aria-pressed', String(favorite))
    favoriteButton.setAttribute(
        'aria-label',
        `${favorite ? 'Remove' : 'Add'} ${product.title} ${favorite ? 'from' : 'to'} favorites`
    )

    const title = el(
        'h3',
        'mt-3 text-lg font-semibold leading-snug text-[#244b3b]',
        product.title || 'Untitled product'
    )

    content.append(
        favoriteButton,
        el(
            'p',
            'mt-3 text-xs font-semibold uppercase tracking-wider text-[#6d806e]',
            product.category || 'Uncategorized'
        ),
        title,
        el(
            'p',
            'mt-2 line-clamp-3 text-sm leading-6 text-[#718077]',
            product.description || 'No description available.'
        )
    )

    const priceRow = el(
        'div',
        'mt-4 flex items-center justify-between gap-3'
    )
    priceRow.append(
        el(
            'p',
            'text-xl font-bold text-[#244b3b]',
            priceText(product.price)
        ),
        el(
            'span',
            'rounded-full bg-[#f4f0df] px-3 py-1 text-sm font-medium text-[#755d23]',
            typeof product.rating === 'number'
                ? `★ ${product.rating.toFixed(1)}`
                : 'No rating'
        )
    )

    content.append(
        priceRow,
        button(
            'View details',
            'mt-5 w-full rounded-xl bg-[#244b3b] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18382b]',
            () => handlers.onDetails(product.id)
        )
    )

    card.append(imageArea, content)
    return card
}

function createEmptyState(state, handlers) {
    const panel = el(
        'div',
        'col-span-full rounded-2xl border border-dashed border-[#d6dccf] bg-white px-6 py-12 text-center'
    )

    panel.append(
        el('h3', 'text-lg font-semibold text-[#244b3b]', 'No products found'),
        el(
            'p',
            'mx-auto mt-2 max-w-lg text-sm leading-6 text-[#718077]',
            'Try another search term or category, or clear your filters.'
        ),
        button(
            'Clear search and filters',
            'mt-5 rounded-xl border border-[#dce1d6] px-4 py-2 text-sm font-semibold text-[#244b3b] hover:bg-[#f1f2e9]',
            handlers.onClearFilters
        )
    )

    return panel
}

function createProductGrid(state, handlers) {
    const section = el('section', 'mt-8')
    const visibleItems = getVisibleItems(state)
    const shownItems = visibleItems.slice(0, state.visibleCount)

    const headingRow = el(
        'div',
        'mb-4 flex flex-wrap items-center justify-between gap-3'
    )

    headingRow.append(
        el('h2', 'text-xl font-semibold text-[#244b3b]', 'Products')
    )

    const count = el(
        'p',
        'text-sm text-[#718077]',
        `${visibleItems.length} matching products · showing ${shownItems.length}`
    )
    count.setAttribute('role', 'status')
    count.setAttribute('aria-live', 'polite')
    headingRow.append(count)

    const grid = el(
        'div',
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
    )

    if (visibleItems.length === 0) {
        grid.append(createEmptyState(state, handlers))
    } else {
        shownItems.forEach((product) => {
            grid.append(createProductCard(product, state, handlers))
        })
    }

    section.append(headingRow, grid)

    if (shownItems.length < visibleItems.length) {
        const loadMoreRow = el('div', 'mt-6 text-center')
        loadMoreRow.append(
            button(
                'Load more products',
                'rounded-xl bg-[#244b3b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#18382b]',
                handlers.onLoadMore
            )
        )
        section.append(loadMoreRow)
    }

    return section
}

function createLoadingPage() {
    const page = el('main', 'mx-auto max-w-7xl px-5 py-8 sm:px-8')
    page.setAttribute('aria-busy', 'true')
    page.append(createHero())

    const status = el(
        'p',
        'mt-8 text-sm font-medium text-[#718077]',
        'Loading products and categories…'
    )
    status.setAttribute('role', 'status')
    status.setAttribute('aria-live', 'polite')
    page.append(status)

    const grid = el(
        'div',
        'mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
    )

    for (let index = 0; index < 6; index += 1) {
        const skeleton = el(
            'div',
            'animate-pulse overflow-hidden rounded-2xl border border-[#e5e7dd] bg-white'
        )
        const image = el('div', 'h-48 bg-[#e9ece2]')
        const lines = el('div', 'space-y-3 p-5')
        lines.append(
            el('div', 'h-3 w-1/3 rounded bg-[#e9ece2]'),
            el('div', 'h-5 w-4/5 rounded bg-[#e9ece2]'),
            el('div', 'h-3 w-full rounded bg-[#e9ece2]'),
            el('div', 'h-3 w-2/3 rounded bg-[#e9ece2]')
        )
        skeleton.append(image, lines)
        grid.append(skeleton)
    }

    page.append(grid)
    return page
}

function createErrorPage(state, handlers) {
    const page = el('main', 'mx-auto max-w-7xl px-5 py-8 sm:px-8')
    page.append(createHero())

    const panel = el(
        'section',
        'mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center'
    )
    panel.setAttribute('role', 'alert')

    panel.append(
        el(
            'h2',
            'text-xl font-semibold text-[#244b3b]',
            'We could not load the products.'
        ),
        el(
            'p',
            'mt-3 text-sm leading-6 text-[#718077]',
            state.error || 'Something went wrong. Please try again.'
        ),
        button(
            'Try again',
            'mt-5 rounded-xl bg-[#244b3b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#18382b]',
            handlers.onRetry
        )
    )

    return page
}

function createDetailsModal(state, handlers) {
    if (state.selectedProductId === null) return null

    const overlay = el(
        'div',
        'fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#17251d]/70 p-4 sm:p-6'
    )

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) handlers.onCloseDetails()
    })

    const dialog = el(
        'section',
        'relative my-auto w-full max-w-3xl rounded-3xl bg-[#fffef9] p-5 shadow-2xl sm:p-8'
    )
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')
    dialog.setAttribute('aria-labelledby', 'product-detail-title')

    const close = button(
        'Close',
        'ml-auto block rounded-xl border border-[#dce1d6] px-4 py-2 text-sm font-semibold text-[#244b3b] hover:bg-[#f1f2e9]',
        handlers.onCloseDetails
    )
    close.setAttribute('aria-label', 'Close product details')
    dialog.append(close)

    if (state.detailStatus === 'loading') {
        const loading = el(
            'p',
            'mt-6 rounded-2xl bg-[#f1f2e9] px-5 py-10 text-center text-sm text-[#52645a]',
            'Loading product details…'
        )
        loading.setAttribute('role', 'status')
        loading.setAttribute('aria-live', 'polite')
        dialog.append(loading)
    } else if (state.detailStatus === 'error') {
        const error = el(
            'div',
            'mt-6 rounded-2xl bg-[#f1f2e9] px-5 py-10 text-center'
        )
        error.append(
            el(
                'p',
                'text-sm text-[#52645a]',
                state.detailError || 'Could not load product details.'
            ),
            button(
                'Try again',
                'mt-4 rounded-xl bg-[#244b3b] px-5 py-3 text-sm font-semibold text-white',
                () => handlers.onDetails(state.selectedProductId)
            )
        )
        dialog.append(error)
    } else if (state.selectedProduct) {
        const product = state.selectedProduct
        const content = el(
            'div',
            'mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2'
        )

        const imageBox = el(
            'div',
            'flex min-h-64 items-center justify-center rounded-2xl bg-[#f1f2e9] p-6'
        )

        if (product.thumbnail) {
            const image = el('img', 'max-h-80 w-full object-contain')
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

        const details = el('div', 'flex flex-col')
        const title = el(
            'h2',
            'mt-2 text-2xl font-semibold leading-tight text-[#244b3b] sm:text-3xl',
            product.title || 'Untitled product'
        )
        title.id = 'product-detail-title'

        details.append(
            el(
                'p',
                'text-xs font-bold uppercase tracking-widest text-[#718077]',
                product.category || 'Uncategorized'
            ),
            title,
            el(
                'p',
                'mt-4 text-2xl font-bold text-[#244b3b]',
                priceText(product.price)
            ),
            el(
                'p',
                'mt-4 text-sm leading-7 text-[#52645a]',
                product.description || 'No description available.'
            ),
            el(
                'p',
                'mt-4 text-sm font-medium text-[#755d23]',
                typeof product.rating === 'number'
                    ? `★ ${product.rating.toFixed(1)} rating`
                    : 'Rating unavailable'
            ),
            el(
                'p',
                'mt-2 text-sm text-[#52645a]',
                typeof product.stock === 'number'
                    ? `Stock: ${product.stock}`
                    : 'Stock information unavailable'
            ),
            el(
                'p',
                'mt-2 text-sm text-[#52645a]',
                product.brand ? `Brand: ${product.brand}` : 'Brand unavailable'
            ),
            el('p', 'mt-2 text-xs text-[#718077]', `Product ID: ${product.id}`)
        )

        content.append(imageBox, details)
        dialog.append(content)
    }

    overlay.append(dialog)
    return overlay
}

export function renderApp(app, state, handlers) {
    const searchWasFocused =
        document.activeElement?.matches?.('[data-search="true"]') ?? false
    const cursorPosition = searchWasFocused
        ? document.activeElement.selectionStart
        : null

    app.replaceChildren()
    app.append(createHeader())

    if (state.status === 'loading') {
        app.append(createLoadingPage())
        return
    }

    if (state.status === 'error') {
        app.append(createErrorPage(state, handlers))
        return
    }

    const page = el(
        'main',
        'mx-auto max-w-7xl space-y-6 px-5 py-8 sm:px-8 sm:py-10'
    )
    page.id = 'top'

    page.append(
        createHero(),
        createStats(state),
        createToolbar(state, handlers),
        createProductGrid(state, handlers)
    )

    app.append(page)

    const modal = createDetailsModal(state, handlers)
    if (modal) {
        app.append(modal)
        modal.querySelector('button')?.focus()
    } else if (searchWasFocused) {
        const search = app.querySelector('[data-search="true"]')
        search?.focus()

        if (cursorPosition !== null && search) {
            search.setSelectionRange(cursorPosition, cursorPosition)
        }
    }
}
