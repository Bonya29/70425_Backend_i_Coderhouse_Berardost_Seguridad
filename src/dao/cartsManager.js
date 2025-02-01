import e from "express"
import { cartsModel } from "./models/cartsModel.js"

export class CartsManager {
    
    static async getCarts() {
        return await cartsModel.find().lean()
    }
    
    // static async getCartById(cid) {
    //     let id = Number(cid)
    //     return await cartsModel.findOne({id}).lean()
    // }

    static async getCartByIdWithPopulate(cid) {
        return await cartsModel.findById(cid).populate('products.product')
    }

    static async getCartById(cid) {
        return await cartsModel.findById(cid).lean()
    }
    

    static async addCart(cart={}) {
        let newCart = await cartsModel.create(cart)
        return newCart.toJSON()
    }
    
    static async addProductToCartById(cid, pid) {
        const cart = await cartsModel.findById(cid)
        console.log(cart)
        let existProduct = cart.products.find(p => p.product.toString() === pid)
        console.log(existProduct)
        if (existProduct) {
            existProduct.quantity += 1
        } else {
            let newProduct = {product: pid, quantity: 1}
            cart.products.push(newProduct)
        }

        await cart.save()
        return cart
    }

    static async updateCart(cid, cart={}) {
        return await cartsModel.findByIdAndUpdate(cid, cart, {new: true}).lean()
    }

    static async deleteCart(cid) {
        return await cartsModel.findByIdAndDelete(cid).lean()
    }

    static async deleteProductsInCartById(cid, cart) {
        return await cartsModel.findByIdAndUpdate(cid, cart, {new: true}).lean()
    }

    static async deleteProductToCartById(cid, pid) {
        const cart = await cartsModel.findById(cid)
        let existProduct = cart.products.find(p => p.product.toString() === pid)
        if (!existProduct) {
            return null
        }

        cart.products = cart.products.filter(p => p.product.toString() !== pid)

        await cart.save()
        return cart
    }
}