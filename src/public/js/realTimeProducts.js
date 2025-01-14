document.title = 'Products'
const socket = io()

socket.on('showProducts', async () => { 
    const response = await fetch('/api/products')
    const data = await response.json()
    const products = data.products
    const productsContainer = document.getElementById('products')
    productsContainer.innerHTML = ''

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
})

socket.on('newProduct', (product) => { 
    const productsContainer = document.getElementById('products')
    const productCard = document.createElement('div')
    productCard.classList.add('card')
    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.title}">
        <h3>${product.title}</h3>
        <p>${product.description}</p>
        <p class="price">$${product.price}</p>`
    productsContainer.appendChild(productCard)
})

function generateForm() {
    const form = document.getElementById('form')
    form.innerHTML = `
        <h2 class="title">Agregar Producto</h2>
        <div class="inputs">
            <div class="input">
                <label for="title">Titulo</label>
                <input type="text" id="title">
            </div>
            <div class="input">
                <label for="description">Descripcion</label>
                <textarea id="description"></textarea>
            </div>
            <div class="input">
                <label for="price">Precio</label>
                <input type="number" id="price">
            </div>
            <div class="input">
                <label for="stock">Stock</label>
                <input type="number" id="stock">
            </div>
            <div class="input">
                <label for="category">Categoria</label>
                <select name="Categoria" id="category" onchange="updateCode()">
                    <option value="">Seleccionar Categoria</option>
                    <option value="Hubs">Hubs</option>
                    <option value="Repetidor de Señal">Repetidor de Señal</option>
                    <option value="Detector de Aperturas">Detector de Aperturas</option>
                    <option value="Detector de Movimiento">Detector de Movimiento</option>
                    <option value="Mandos">Mandos</option>
                    <option value="Teclados">Teclados</option>
                    <option value="Sirenas">Sirenas</option>
                </select>
            </div>
            <div class="input">
                <label for="code">Codigo</label>
                <input type="text" id="code">
            </div>
        </div>
        <div class="btns">
        <button onclick="addProduct()" class="add">Agregar Producto</button>
        </div>`
}

async function addProduct() {
    const response = await fetch('/api/products')
    const data = await response.json()
    const products = data.products

    let id = products.length + 1
    let image = "/assets/noImageYet.png"
    let title = document.getElementById('title').value
    let description = document.getElementById('description').value
    let price = document.getElementById('price').value
    let stock = document.getElementById('stock').value
    let category = document.getElementById('category').value
    let code = document.getElementById('code').value
    let status = true
    
    let existTitle = products.find(prod => prod.title.toLowerCase().replace(/\s+/g, "") === title.toLowerCase().replace(/\s+/g, ""))
    let existCode = products.find(prod => prod.code.toUpperCase().replace(/\s+/g, "") === code.toUpperCase().replace(/\s+/g, ""))

    if (title == "" || description == "" || price == "" || stock == "" || category == "" || code == "") {
        alert("Todos los campos son obligatorios")
        return
    } else if (existTitle) {
        alert(`Ya existe un producto con el nombre ${title}`)
        return
    } else if (existCode) {
        alert(`Ya existe un producto con el codigo ${code}`)
        return
    } else {
        class Product {
            constructor(id, image, title, description, price, stock, category, code, status) {
                this.id = id
                this.image = image
                this.title = title
                this.description = description
                this.price = price
                this.stock = stock
                this.category = category
                this.code = code
                this.status = status
            }
        }

        let product = new Product(id, image, title, description, price, stock, category, code, status)
        socket.emit('newProduct', product)
        alert("Producto agregado correctamente")
        document.getElementById('title').value = ""
        document.getElementById('description').value = ""
        document.getElementById('price').value = ""
        document.getElementById('stock').value = ""
        document.getElementById('category').value = ""
        document.getElementById('code').value = ""
    }
}

function updateCode() {
    const categoryPrefixes = {
        "Hubs": "A",
        "Repetidor de Señal": "B",
        "Detector de Aperturas": "C",
        "Detector de Movimiento": "D",
        "Mandos": "E",
        "Teclados": "F",
        "Sirenas": "G"
    }

    const category = document.getElementById("category").value
    const codeInput = document.getElementById("code")

    if (categoryPrefixes[category]) {
        codeInput.value = categoryPrefixes[category]
    } else {
        codeInput.value = ""
    }
}