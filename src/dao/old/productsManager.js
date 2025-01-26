import fs from "fs"

export class ProductsManager {
    static #path = ""

    static setPath(rutaArchivo = "") {
        this.#path = rutaArchivo
    }

    static async getProducts() {
        if (fs.existsSync(this.#path)) {
            return JSON.parse(await fs.promises.readFile(this.#path, {encoding:"utf-8"}))
        } else {
            return []
        }
    }
    
    static async getProductsById(pids) {
        let products = await this.getProducts()
        if (Array.isArray(pids)) {
            return products.filter(prod => pids.includes(prod.id))
        } else {
            return products.find(prod => prod.id === pids)
        }
    }

    static async getProductsByCode(code) {
        let products = await this.getProducts()
        let product = products.find(prod => prod.code.toUpperCase().replace(/\s+/g, "") === code.toUpperCase().replace(/\s+/g, ""))
        return product
    }

    static async getProductsByTitle(title) {
        let products = await this.getProducts()
        let product = products.find(prod => prod.title.toLowerCase().replace(/\s+/g, "") === title.toLowerCase().replace(/\s+/g, ""))
        return product
    }

    static async addProduct(product={}) {
        let products = await this.getProducts()
        let id = 1
        if (products.length > 0) {
            id = Math.max(...products.map(prod => prod.id)) + 1
        }
        let newProduct = {id, ...product}
        products.push(newProduct)
        await fs.promises.writeFile(this.#path, JSON.stringify(products, null, "\t"))
        return newProduct
    }

    static async updateProduct(pid, updates={}) {
        let products = await this.getProducts()
        let index = products.findIndex(prod => prod.id === pid)
        if (index === -1) {
            throw new Error(`No existe ningun producto con el id ${pid}`)
        }
        let id = pid
        products[index] = {...products[index], ...updates, id}
        await fs.promises.writeFile(this.#path, JSON.stringify(products, null, "\t"))
        return products[index]
    }

    static async deleteProduct(pid) {
        let products = await this.getProducts()
        let index = products.findIndex(prod => prod.id === pid)
        if (index === -1) {
            throw new Error(`No existe ningun producto con el id ${pid}`)
        }
        products.splice(index, 1)
        await fs.promises.writeFile(this.#path, JSON.stringify(products, null, "\t"))
    }
}