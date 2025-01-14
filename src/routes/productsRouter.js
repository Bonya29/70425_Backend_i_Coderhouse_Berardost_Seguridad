import { Router } from "express"
import { ProductsManager } from "../dao/productsManager.js"
import { iSvError } from "../utils/svError.js"
export const router = Router()
ProductsManager.setPath("./src/data/products.json")

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
        let product = await ProductsManager.getProductsById(pid)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el id ${pid}`})
        }
        res.status(200).json({product})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/title/:title", async (req, res) => {
    let {title} = req.params
    try {
        let product = await ProductsManager.getProductsByTitle(title)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el nombre ${title}`})
        }
        res.status(200).json({product})
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/code/:code", async (req, res) => {
    let {code} = req.params
    try {
        let product = await ProductsManager.getProductsByCode(code)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el codigo ${code}`})
        }
        res.status(200).json({product})
    } catch (error) {
        iSvError(res, error)
    }
})

router.post("/", async (req, res) => { 
    let {title, description, price, stock, category, code, status = true} = req.body
    if (!title || !description || !price || !stock || !category || !code || !status) {
        return res.status(400).json({error:"Todos los campos son obligatorios. {title, description, price, stock, category, code, status}"})
    }
    if (typeof title !== 'string' || typeof description !== 'string' || typeof price !== 'number' || typeof stock !== 'number' || typeof category !== 'string' || typeof code !== 'string' || typeof status !== 'boolean') {
        return res.status(400).json({error:`Tipos de datos incorrectos. (title = string, description = string, price = number, stock = number, category = string, code = string, status = boolean,)`})
    }
    try {
        let existTitle = await ProductsManager.getProductsByTitle(title)
        let existCode = await ProductsManager.getProductsByCode(code)
        if (existTitle) {
            return res.status(400).json({error:`Ya existe un producto con el nombre ${title}`})
        } else if (existCode) {
            return res.status(400).json({error:`Ya existe un producto con el codigo ${code}`})
        }
        let newProduct = await ProductsManager.addProduct({title, description, price, stock, category, code, status})
        return res.status(201).json({message: "Se ha añadido un nuevo producto", newProduct})
    } catch (error) {
        iSvError(res, error)
    }
})

router.put("/:pid", async (req, res) => {
    let {pid} = req.params
    pid = Number(pid)
    if (isNaN(pid)) {
        return res.status(400).json({error:"El id debe ser un número"})
    }
    let newProductData = req.body
    if (newProductData.id) {
        return res.status(400).json({error:`El id no puede ser modificado`})
    }
    try{
        if (newProductData.title && typeof newProductData.title !== 'string' || newProductData.description && typeof newProductData.description !== 'string' || newProductData.price && typeof newProductData.price !== 'number' || newProductData.stock && typeof newProductData.stock !== 'number' || newProductData.category && typeof newProductData.category !== 'string' || newProductData.code && typeof newProductData.code !== 'string' || newProductData.status && typeof newProductData.status !== 'boolean') {
            return res.status(400).json({error:`Tipos de datos incorrectos. (title = string, description = string, price = number, stock = number, category = string, code = string, status = boolean,)`})
        }
        if (newProductData.title) {
            let existTitle = await ProductsManager.getProductsByTitle(newProductData.title)
            if (existTitle) {
                return res.status(400).json({error:`Ya existe un producto con el nombre ${newProductData.title}`})
            }
        }
        if (newProductData.code) {
            let existCode = await ProductsManager.getProductsByCode(newProductData.code)
            if (existCode) {
                return res.status(400).json({error:`Ya existe un producto con el codigo ${newProductData.code}`})
            }
        }
        let updatedProduct = await ProductsManager.updateProduct(pid, newProductData)
        return res.status(200).json({message: "Se ha actualizado el producto", updatedProduct})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/:pid", async (req, res) => {
    let {pid} = req.params
    pid = Number(pid)
    if (isNaN(pid)) {
        return res.status(400).json({error:"El id debe ser un número"})
    }
    try {
        await ProductsManager.deleteProduct(pid)
        let products = await ProductsManager.getProducts()
        return res.status(200).json({message: "Se ha eliminado el producto", products})
    } catch (error) {
        iSvError(res, error)
    }
})