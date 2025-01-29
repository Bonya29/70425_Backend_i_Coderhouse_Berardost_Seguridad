import { Router } from "express"
import { ProductsManager } from "../dao/productsManager.js"
import { iSvError } from "../utils/svError.js"
import { isValidObjectId } from "mongoose"
export const router = Router()

router.get("/", async (req, res) => {
    try {
        let products = await ProductsManager.getProducts()
        let {limit} = req.query
        if (limit) {
            products = products.slice(0, limit)
        } 
        res.status(200).json({products})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/:pid", async (req, res) => {
    let {pid} = req.params
    pid = Number(pid)
    if (isNaN(pid)) {
        return res.status(400).json({error:"El id debe ser un número"})
    }
    try {
        let product = await ProductsManager.getProductById(pid)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el id ${pid}`})
        }
        res.status(200).json({product})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/code/:code", async (req, res) => {
    let {code} = req.params
    try {
        let product = await ProductsManager.getProductByCode(code)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el codigo ${code}`})
        }
        res.status(200).json({product})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/title/:title", async (req, res) => {
    let {title} = req.params
    try {
        let product = await ProductsManager.getProductByTitle(title)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el nombre ${title}`})
        }
        res.status(200).json({product})
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
        let product = await ProductsManager.getProductByMongoId(mongoId)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el MongoId ${mongoId}`})
        }
        res.status(200).json({product})
    } catch (error) {
        iSvError(res, error)
    }
})

router.post("/", async (req, res) => { 
    try {
        let {title, description, price, stock, category, code, status = true} = req.body
        if (!title || !description || !price || !stock || !category || !code) {
            return res.status(400).json({error:"Todos los campos, a excepción de status, son obligatorios. {title, description, price, stock, category, code, status}"})
        }
        if (typeof title !== 'string' || typeof description !== 'string' || typeof price !== 'number' || typeof stock !== 'number' || typeof category !== 'string' || typeof code !== 'string' || typeof status !== 'boolean') {
            return res.status(400).json({error:`Tipos de datos incorrectos. (title = string, description = string, price = number, stock = number, category = string, code = string, status = boolean,)`})
        }
        let existTitle = await ProductsManager.getProductByTitle(title)
        let existCode = await ProductsManager.getProductByCode(code)
        if (existTitle) {
            return res.status(400).json({error:`Ya existe un producto con el nombre ${title}`})
        } else if (existCode) {
            return res.status(400).json({error:`Ya existe un producto con el codigo ${code}`})
        }
        let products = await ProductsManager.getProducts()
        let image = "/assets/noImageYet.png"
        let id = 1
        if (products.length > 0) {
            id = Math.max(...products.map(prod => prod.id)) + 1
        }
        let newProduct = await ProductsManager.addProduct({id, image, title, description, price, stock, category, code, status})
        return res.status(201).json({message: "Se ha añadido un nuevo producto", newProduct})
    } catch (error) {
        iSvError(res, error)
    }
})

router.put("/:mongoId", async (req, res) => {
    let {mongoId} = req.params
    if (!isValidObjectId(mongoId)) {
        return res.status(400).json({error:"El id debe ser un id de mongo"})
    }
    try{
        let newProductData = req.body
        if (newProductData.id) {
            return res.status(400).json({error:`El id del producto no puede ser modificado`})
        }
        let existProduct = await ProductsManager.getProductByMongoId(mongoId)
        if (!existProduct) {
            return res.status(404).json({error: `no existe ningun producto con el MongoId ${mongoId}`})
        }
        if (newProductData.title && typeof newProductData.title !== 'string' || newProductData.description && typeof newProductData.description !== 'string' || newProductData.price && typeof newProductData.price !== 'number' || newProductData.stock && typeof newProductData.stock !== 'number' || newProductData.category && typeof newProductData.category !== 'string' || newProductData.code && typeof newProductData.code !== 'string' || newProductData.status && typeof newProductData.status !== 'boolean') {
            return res.status(400).json({error:`Tipos de datos incorrectos. (title = string, description = string, price = number, stock = number, category = string, code = string, status = boolean,)`})
        }
        if (newProductData.title) {
            let existTitle = await ProductsManager.getProductByTitle(newProductData.title)
            if (existTitle) {
                return res.status(400).json({error:`Ya existe un producto con el nombre ${newProductData.title}`})
            }
        }
        if (newProductData.code) {
            let existCode = await ProductsManager.getProductByCode(newProductData.code)
            if (existCode) {
                return res.status(400).json({error:`Ya existe un producto con el codigo ${newProductData.code}`})
            }
        }
        let updatedProduct = await ProductsManager.updateProduct(mongoId, newProductData)
        return res.status(200).json({message: "Se ha actualizado el producto", updatedProduct})
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
        let existProduct = await ProductsManager.getProductByMongoId(mongoId)
        if (!existProduct) {
            return res.status(404).json({error: `no existe ningun producto con el MongoId ${mongoId}`})
        }
        await ProductsManager.deleteProduct(mongoId)
        let products = await ProductsManager.getProducts()
        return res.status(200).json({message: "Se ha eliminado el producto", products})
    } catch (error) {
        iSvError(res, error)
    }
})