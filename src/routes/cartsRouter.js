import { Router } from "express"
import { CartsManager } from "../dao/cartsManager.js"
import { ProductsManager } from "../dao/productsManager.js"
import { iSvError } from "../utils/svError.js"
import { isValidObjectId } from "mongoose"
export const router = Router()

router.get("/", async (req, res) => {
    try {
        let carts = await CartsManager.getCarts()
        return res.status(200).json({carts})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/:cid", async (req, res) => {
    let {cid} = req.params
    cid = Number(cid)
    if (isNaN(cid)) {
        return res.status(400).json({error:"El id debe ser un número"})
    }
    try {
        let cart = await CartsManager.getCartById(cid)
        if (!cart) {
            return res.status(404).json({error:`No existe ningun carrito con el id ${cid}`})
        }
        let productIds = cart.products.map(prod => prod.product)
        let products = await ProductsManager.getProductsByIds(productIds)
        return res.status(200).json({cart, products})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/mongoid/:mongoId", async (req, res) => {
    let {mongoId} = req.params
    if (!isValidObjectId(mongoId)) {
        return res.status(400).json({error:"El id debe ser un id de mongo"})
    }
    try {
        let cart = await CartsManager.getCartByMongoId(mongoId)
        if (!cart) {
            return res.status(404).json({error:`No existe ningun producto con el MongoId ${mongoId}`})
        }
        let productIds = cart.products.map(prod => prod.product)
        let products = await ProductsManager.getProductsByIds(productIds)
        return res.status(200).json({cart, products})
    } catch (error) {
        iSvError(res, error)
    }
})

router.post("/", async (req, res) => {
    try {
        let {products: [{product, quantity}]} = req.body
        if (!product || !quantity) {
            return res.status(400).json({error:"Es necesario enviar el id del producto y la cantidad. {products: [{product, quantity}]}"})
        }
        if (typeof product !== "number" || typeof quantity !== "number") {
            return res.status(400).json({error:"El id del producto y la cantidad deben ser números."})
        }
        let existProduct = await ProductsManager.getProductById(product)
        if (!existProduct) {
            return res.status(404).json({error:`No existe ningun producto con el id ${product}`})
        }
        let carts = await CartsManager.getCarts()
        let id = 1
        if (carts.length > 0) {
            id = Math.max(...carts.map(cart => cart.id)) + 1
        }
        let newCart = await CartsManager.addCart({id, products: [{product, quantity}]})
        return res.status(200).json({message: "Se ha creado el carrito", newCart})
    } catch (error) {
        iSvError(res, error)
    }
})


router.post("/:cMongoId/product/:pid", async (req, res) => {
    let {cMongoId, pid} = req.params
    if (!isValidObjectId(cMongoId)) {
        return res.status(400).json({error:"El id debe ser un id de mongo"})
    }
    if (isNaN(pid)) {
        return res.status(400).json({error:"El id del producto debe ser un número"})
    }
    try {
        let existProduct = await ProductsManager.getProductById(pid)
        if (!existProduct) {
            return res.status(404).json({error:`No existe ningun producto con el id ${pid}`})
        }
        let cart = await CartsManager.getCartByMongoId(cMongoId)
        if (!cart) {
            return res.status(404).json({error:`No existe ningun carrito con el MongoId ${cMongoId}`})
        }
        let updatedCart = await CartsManager.addProductToCartByMongoId(cMongoId, pid)
        return res.status(200).json({message: "Se ha añadido el producto al carrito", cart: updatedCart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/:mongoId", async (req, res) => {
    let {mongoId} = req.params
    if (!isValidObjectId(mongoId)) {
        return res.status(400).json({error:"El id debe ser un id de mongo"})
    }
    try {
        let existCart = await CartsManager.getCartByMongoId(mongoId)
        if (!existCart) {
            return res.status(404).json({error: `no existe ningun carrito con el MongoId ${mongoId}`})
        }
        await CartsManager.deleteCart(mongoId)
        let carts = await CartsManager.getCarts()
        return res.status(200).json({message: "Se ha eliminado el carrito", carts})
    } catch (error) {
        iSvError(res, error)
    }
})