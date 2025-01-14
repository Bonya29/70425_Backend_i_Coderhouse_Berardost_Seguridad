document.title = 'Home'

async function fetchProducts() {
    const response = await fetch('/api/products')
    const data = await response.json()
    showProducts(data)
}

function showProducts(data) { 
    const products = data.products
    const productsContainer = document.getElementById('products')
    products.forEach(product => {
        const productCard = document.createElement('div')
        productCard.classList.add('card')
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <p class="price">$${product.price}</p>`
        productsContainer.appendChild(productCard)
    })
}

fetchProducts()