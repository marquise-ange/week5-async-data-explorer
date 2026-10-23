# Product Grove — Async Data Explorer

A responsive product explorer built with vanilla JavaScript, Vite, and Tailwind CSS. The application fetches product data asynchronously and lets users search, filter, sort, save favorites, and view individual product details.

## Live Demo

https://week5-async-data-explorer-7jlt.onrender.com/

## GitHub Repository

https://github.com/marquise-ange/week5-async-data-explorer

## Features

### Required features
- Fetch product data asynchronously on page load.
- Reusable `getJSON(url)` helper with HTTP error handling.
- Loading skeletons while data is loading.
- Error state with a Retry button.
- Empty state when no products match the search or filters.
- Responsive product grid.
- Live, case-insensitive search.
- Dynamic product categories.
- Sorting by default order, ascending price, descending price, and name.
- Individual product details fetched from the API.
- Product statistics calculated using `reduce()`.
- Concurrent product and category requests using `Promise.all()`.

### Bonus features
- Save and remove favorite products.
- Persist favorites in `localStorage`.
- Show favorites only.
- Load More pagination.

## Technologies
- HTML
- Tailwind CSS v4
- JavaScript ES modules
- Vite
- DummyJSON Products API
- Git and GitHub

## Project Structure

```text
week5-async-data-explorer/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/
│   └── screenshots/
└── src/
    ├── api.js
    ├── main.js
    ├── render.js
    └── style.css
```

## Getting Started

### Requirements
- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd week5-async-data-explorer
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production version:

```bash
npm run build
```

## API

This project uses the DummyJSON Products API:

- Products: `https://dummyjson.com/products?limit=0`
- Categories: `https://dummyjson.com/products/categories`
- Individual product: `https://dummyjson.com/products/1`

## Screenshots

Add your screenshots to `public/screenshots/`.

### Loading State
![Loading state](public/screenshots/loading.png)

### Successful Results
![Successful results](/public/sreenshots/sucess.jpeg)

### Empty State
![Empty state](/public/sreenshots/empty.jpeg)

### Error State
![Error state](/public/sreenshots/error.jpeg)

## Accessibility and Error Handling

The application uses semantic HTML, accessible form labels, visible keyboard focus styles, status announcements, and safe DOM text insertion. API errors are handled with user-facing messages and retry options.


## Learning Outcomes

This project demonstrates asynchronous JavaScript, the Fetch API, reusable API helpers, Promise-based concurrency, array methods, DOM rendering, event handling, state management, responsive design, and localStorage.
