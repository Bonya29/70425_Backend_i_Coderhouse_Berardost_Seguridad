import e, { Router } from "express"
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
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let cart = await CartsManager.getCartByIdWithPopulate(cid)
        if (!cart) {
            return res.status(404).json({error:`No existe ningun carrito con el MongoId ${cid}`})
        }
        return res.status(200).json({cart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.post("/", async (req, res) => {
    try {
        let { products = [] } = req.body
        if (products.length === 0) {            
            let newCart = await CartsManager.addCart({products: []})
            return res.status(200).json({ message: "Se ha creado el carrito vacío", newCart })
        }
        let {products: [{product, quantity}]} = req.body
        if (!product || !quantity) {
            return res.status(400).json({error:"Es necesario enviar tanto id del producto como la cantidad del mismo. {products: [{product, quantity}]} En caso que quiera crear un carrito vacío, realizar la solicitud sin enviar nada."})
        }
        if (typeof quantity !== "number") {
            return res.status(400).json({error:"quantity debe ser un numero."})
        }
        if (typeof product !== "string" || product.length !== 24) {
            return res.status(400).json({error: "id no valido, debe ser un id de mongo, tipo string con 24 caracteres"})
        }
        let existProduct = await ProductsManager.getProductById(product)
        if (!existProduct) {
            return res.status(404).json({error:`No existe ningun producto con el id ${product}`})
        }
        let newCart = await CartsManager.addCart({products: [{product, quantity}]})
        return res.status(200).json({message: "Se ha creado el carrito", newCart})
    } catch (error) {
        iSvError(res, error)
    }
})


router.post("/:cid/product/:pid", async (req, res) => {
    let {cid, pid} = req.params
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id del carrito ingresado no es valido, debe ser un id de mongo"})
    }
    if (!isValidObjectId(pid)) {
        return res.status(400).json({error:"El id del producto ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let existProduct = await ProductsManager.getProductById(pid)
        if (!existProduct) {
            return res.status(404).json({error:`No existe ningun producto con el id ${pid}`})
        }
        let cart = await CartsManager.getCartById(cid)
        if (!cart) {
            return res.status(404).json({error:`No existe ningun carrito con el MongoId ${cid}`})
        }
        let updatedCart = await CartsManager.addProductToCartById(cid, pid)
        return res.status(200).json({message: "Se ha añadido el producto al carrito", cart: updatedCart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.put("/:cid", async (req, res) => {
    let {cid} = req.params
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try{
        let newCartData = req.body
        if (newCartData.id || newCartData._id || newCartData.createdAt || newCartData.updatedAt) { 
            return res.status(400).json({error:`El MongoID y otros datos de mongo del carrito no pueden ser modificados`})
        }
        let existCart = await CartsManager.getCartById(cid)
        if (!existCart) {
            return res.status(404).json({error: `no existe ningun carrito con el MongoId ${cid}`})
        }
        if (!newCartData.products) {
            return res.status(400).json({error:"Es necesario enviar tanto el id del producto como la cantidad del mismo{products: [{product, quantity}, {product, quantity}]} En caso que quiera vaciar el carrito, enviar {products: []}"})
        }
        for (const item of newCartData.products) {
            if (!("product" in item) || !("quantity" in item)) {
                return res.status(400).json({ error: "Cada producto debe incluir tanto 'product' como 'quantity'" })
            }
        }
        const invalidProduct = newCartData.products.find(item => typeof item.product !== 'string' || item.product.length !== 24)
        if (invalidProduct) {
            return res.status(400).json({ error: "id del producto no valido, debe ser un id de mongo, tipo string con 24 caracteres" })
        }
        const invalidQuantity = newCartData.products.find(item => typeof item.quantity !== 'number' || item.quantity <= 0)
        if (invalidQuantity) {
            return res.status(400).json({ error: "quantity debe ser un número mayor a 0." })
        }

        let pIds = newCartData.products.map(item => item.product)
        let existingProducts = await ProductsManager.getProductsByIds(pIds)
        let existingProductIds = existingProducts.map(product => product._id.toString())
        let invalidProductIds = pIds.filter(id => !existingProductIds.includes(id))
        if (invalidProductIds.length > 0) {
            return res.status(400).json({ error: `Los siguientes productos no existen en la base de datos: ${invalidProductIds.join(", ")}` })
        }

        let updatedCart = await CartsManager.updateCart(cid, newCartData)
        return res.status(200).json({message: "Se ha actualizado el carrito", updatedCart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.put("/:cid/product/:pid", async (req, res) => {
    let {cid, pid} = req.params
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id del carrito ingresado no es valido, debe ser un id de mongo"})
    }
    if (!isValidObjectId(pid)) {
        return res.status(400).json({error:"El id del producto ingresado no es valido, debe ser un id de mongo"})
    }
    try{
        let existCart = await CartsManager.getCartById(cid)
        if (!existCart) {
            return res.status(404).json({error: `no existe ningun carrito con el MongoId ${cid}`})
        }
        let existProductInCart = existCart.products.find(prod => prod.product.toString() === pid)
        if (!existProductInCart) {
            return res.status(404).json({error:`No existe ningun producto con el id ${pid} en el carrito`})
        } 
        let { quantity } = req.body
        if (typeof quantity !== "number" || isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({error: "quantity debe ser un número mayor a 0"})
        }
        
        let newCartData = {
            products: existCart.products.map(prod =>
                prod.product.toString() === pid ? { ...prod, quantity } : prod
            )
        }

        let updatedCart = await CartsManager.updateCart(cid, newCartData)
        return res.status(200).json({message: `Se ha actualizado la cantidad del producto ${pid} en el carrito`, updatedCart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/:cid", async (req, res) => {
    let {cid} = req.params
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let existCart = await CartsManager.getCartById(cid)
        if (!existCart) {
            return res.status(404).json({error: `no existe ningun carrito con el MongoId ${cid}`})
        }
        let cleanCart = {products: []}
        await CartsManager.deleteProductsInCartById(cid, cleanCart)
        return res.status(200).json({message: `Se ha limpiado el carrito`, cleanCart})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/deleteCart/:cid", async (req, res) => {
    let {cid} = req.params
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let existCart = await CartsManager.getCartById(cid)
        if (!existCart) {
            return res.status(404).json({error: `no existe ningun carrito con el MongoId ${cid}`})
        }
        await CartsManager.deleteCart(cid)
        let carts = await CartsManager.getCarts()
        return res.status(200).json({message: "Se ha eliminado el carrito", carts})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/:cid/product/:pid", async (req, res) => {
    let {cid, pid} = req.params
    if (!isValidObjectId(cid)) {
        return res.status(400).json({error:"El id del carrito ingresado no es valido, debe ser un id de mongo"})
    }
    if (!isValidObjectId(pid)) {
        return res.status(400).json({error:"El id del producto ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let cart = await CartsManager.getCartById(cid)
        if (!cart) {
            return res.status(404).json({error:`No existe ningun carrito con el MongoId ${cid}`})
        }

        let updatedCart = await CartsManager.deleteProductToCartById(cid, pid)
        if (!updatedCart) {
            return res.status(404).json({error:`No existe ningun producto con el id ${pid} en el carrito con el MongoId ${cid}`})
        }
        return res.status(200).json({message: "Se ha eliminado el producto del carrito", cart: updatedCart})
    } catch (error) {
        iSvError(res, error)
    }
})