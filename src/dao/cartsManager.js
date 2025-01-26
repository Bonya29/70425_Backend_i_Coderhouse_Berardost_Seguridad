import { cartsModel } from "./models/cartsModel.js"

export class CartsManager {
    
    static async getCarts() {
        return await cartsModel.find().lean()
    }
    
    static async getCartById(cid) {
        let id = Number(cid)
        return await cartsModel.findOne({id}).lean()
    }

    static async getCartByMongoId(mongoId) {
        return await cartsModel.findById(mongoId).lean()
    }
    
    static async addCart(cart={}) {
        let newCart = await cartsModel.create(cart)
        return newCart.toJSON()
    }
    
    static async addProductToCartByMongoId(cMongoId, pid) {
        const cart = await cartsModel.findById(cMongoId)
        let existProduct = cart.products.find(p => p.product === Number(pid))
        if (existProduct) {
            existProduct.quantity += 1
        } else {
            let newProduct = {product: pid, quantity: 1}
            cart.products.push(newProduct)
        }

        await cart.save()
        return cart
    }
    
    static async deleteCart(mongoId) {
        return await cartsModel.findByIdAndDelete(mongoId).lean()
    }
}