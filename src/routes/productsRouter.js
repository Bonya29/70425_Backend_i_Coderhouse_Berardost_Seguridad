import { Router } from "express"
import { ProductsManager } from "../dao/productsManager.js"
import { iSvError } from "../utils/svError.js"
import { isValidObjectId } from "mongoose"
export const router = Router()

router.get("/", async (req, res) => {
    try {
        let {limit, page, query, sort} = req.query
        let queryParam = query
        let sortParam = sort
        
        if (!limit) {
            limit = 10
        }

        if (!page) {
            page = 1
        }
        
        if (query) {
            query = {category: query}
        } else {
            queryParam = ""
        }

        if (sort === "asc") {
            sort = {price: 1}
        } else if (sort === "desc") {
            sort = {price: -1}
        } else {
            sortParam = ""
        }

        let {docs: products, totalPages, hasPrevPage, prevPage, hasNextPage, nextPage} = await ProductsManager.getProducts(limit, page, query, sort)
        let prevLink
        let nextLink

        if (hasPrevPage) {
            prevLink = `http://localhost:8080/api/products?limit=${limit}&page=${prevPage}`
            if (queryParam !== "") {
                prevLink += `&query=${encodeURIComponent(queryParam)}`
            }
            if (sortParam !== "") {
                prevLink += `&sort=${sortParam}`
            }
        } else {
            prevLink = ""
        }
        
        if (hasNextPage) {
            nextLink = `http://localhost:8080/api/products?limit=${limit}&page=${nextPage}`
            if (queryParam !== "") {
                nextLink += `&query=${encodeURIComponent(queryParam)}`
            }
            if (sortParam !== "") {
                nextLink += `&sort=${sortParam}`
            }
        } else {
            nextLink = ""
        }

        res.status(200).json(
            {
                status: "success", 
                payload: products, 
                totalPages,
                prevPage,
                nextPage,
                hasPrevPage, 
                hasNextPage, 
                prevLink,
                nextLink
                })
    } catch (error) {
        iSvError(res, error)
    }
})

router.get("/:pid", async (req, res) => {
    let {pid} = req.params
    if (!isValidObjectId(pid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let product = await ProductsManager.getProductById(pid)
        if (!product) {
            return res.status(404).json({error:`No existe ningun producto con el MongoId ${pid}`})
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
        let image = "/assets/noImageYet.png"
        let newProduct = await ProductsManager.addProduct({image, title, description, price, stock, category, code, status})
        return res.status(201).json({message: "Se ha añadido un nuevo producto", newProduct})
    } catch (error) {
        iSvError(res, error)
    }
})

router.put("/:pid", async (req, res) => {
    let {pid} = req.params
    if (!isValidObjectId(pid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try{
        let newProductData = req.body
        if (newProductData.id || newProductData._id || newProductData.createdAt || newProductData.updatedAt) { 
            return res.status(400).json({error:`El MongoID y otros datos de mongo del producto no pueden ser modificados`})
        }
        let existProduct = await ProductsManager.getProductById(pid)
        if (!existProduct) {
            return res.status(404).json({error: `no existe ningun producto con el MongoId ${pid}`})
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
        let updatedProduct = await ProductsManager.updateProduct(pid, newProductData)
        return res.status(200).json({message: "Se ha actualizado el producto", updatedProduct})
    } catch (error) {
        iSvError(res, error)
    }
})

router.delete("/:pid", async (req, res) => {
    let {pid} = req.params
    if (!isValidObjectId(pid)) {
        return res.status(400).json({error:"El id ingresado no es valido, debe ser un id de mongo"})
    }
    try {
        let existProduct = await ProductsManager.getProductById(pid)
        if (!existProduct) {
            return res.status(404).json({error: `no existe ningun producto con el MongoId ${pid}`})
        }
        await ProductsManager.deleteProduct(pid)
        let products = await ProductsManager.getProducts(100)
        return res.status(200).json({message: "Se ha eliminado el producto", products})
    } catch (error) {
        iSvError(res, error)
    }
})