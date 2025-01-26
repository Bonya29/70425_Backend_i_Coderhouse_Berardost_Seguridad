import { Router } from "express"
import { CartsManager } from "../dao/cartsManager.js"
import { ProductsManager } from "../dao/productsManager.js"
import { iSvError } from "../utils/svError.js"
export const router = Router()
CartsManager.setPath("./src/data/carts.json")
ProductsManager.setPath("./src/data/products.json")

router.post("/", async (req, res) => {
    let {products: [{product, quantity}]} = req.body
    if (!product || !quantity) {
        return res.status(400).json({error:"Es necesario enviar el id del producto y la cantidad. {products: [{product, quantity}]}"})
    }
    if (typeof product !== "number" || typeof quantity !== "number") {
        return res.status(400).json({error:"El id del producto y la cantidad deben ser números."})
    }
    let existProduct = await ProductsManager.getProductsById(product)
    if (!existProduct) {
        return res.status(404).json({error:`No existe ningun producto con el id ${product}`})
    }
    try {
        let newCart = await CartsManager.addCart({products: [{product, quantity}]})
        return res.status(200).json({message: "Se ha creado el carrito", newCart})
    } catch (error) {
        iSvError(res, error)
    }
})

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
        let products = await ProductsManager.getProductsById(productIds)
        return res.status(200).json({cart, products})
    } catch (error) {
        iSvError(res, error)
    }
})

router.post("/:cid/product/:pid", async (req, res) => {
    let {cid, pid} = req.params
    cid = Number(cid)
    pid = Number(pid)
    if (isNaN(cid) || isNaN(pid)) {
        return res.status(400).json({error:"Ambos id deben ser numericos"})
    }
    let existProduct = await ProductsManager.getProductsById(pid)
    if (!existProduct) {
        return res.status(404).json({error:`No existe ningun producto con el id ${pid}`})
    }
    try {
        let updatedCart = await CartsManager.addProductToCartById(cid, pid)
        return res.status(200).json({message: "Se ha añadido el producto al carrito", cart: updatedCart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/:cid", async (req, res) => {
    let {cid} = req.params
    cid = Number(cid)
    if (isNaN(cid)) {
        return res.status(400).json({error:"El id debe ser un número"})
    }
    try {
        await CartsManager.deleteCart(cid)
        let carts = await CartsManager.getCarts()
        return res.status(200).json({message: "Se ha eliminado el carrito", carts})
    } catch (error) {
        iSvError(res, error)
    }
})