import fs from "fs"

export class CartsManager {
    static #path = ""

    static setPath(rutaArchivo = "") {
        this.#path = rutaArchivo
    }

    static async getCarts() {
        if (fs.existsSync(this.#path)) {
            return JSON.parse(await fs.promises.readFile(this.#path, {encoding:"utf-8"}))
        } else {
            return []
        }
    }

    static async getCartById(cid) {
        let carts = await this.getCarts()
        let cart = carts.find(cart => cart.id === cid)
        return cart
    }

    static async addCart(cart={}) {
        let carts = await this.getCarts()
        let id = 1
        if (carts.length > 0) {
            id = Math.max(...carts.map(cart => cart.id)) + 1
        }
        let newCart = {id, ...cart}
        carts.push(newCart)
        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"))
        return newCart
    }

    static async addProductToCartById(cid, pid) {
        let carts = await this.getCarts()
        let cart = carts.find(cart => cart.id === cid)
        if (!cart) {
            throw new Error(`No existe ningún carrito con el id ${cid}`)
        }
        let existProduct = cart.products.find(p => p.product === pid)
        if (existProduct) {
            existProduct.quantity += 1
        } else {
            let newProduct = {product: pid, quantity: 1}
            cart.products.push(newProduct)
        }
        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"))
        return cart
    }

    static async deleteCart(cid) {
        let carts = await this.getCarts()
        let index = carts.findIndex(cart => cart.id === cid)
        if (index === -1) {
            throw new Error(`No existe ningun carrito con el id ${cid}`)
        }
        carts.splice(index, 1)
        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"))
    }
}