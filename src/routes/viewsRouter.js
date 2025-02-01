import { Router } from 'express'
import { ProductsManager } from "../dao/productsManager.js"
export const router = Router()

router.get('/products', async (req, res) => {
    let {page} = req.query
    if (!page) {
        page = 1
    }

    let {docs: products, totalPages, hasPrevPage, prevPage, hasNextPage, nextPage} = await ProductsManager.getProducts(10, page, {}, {code: 1})

    return res.status(200).render(
        'home',
        {
            products,
            totalPages, 
            hasPrevPage, 
            prevPage, 
            hasNextPage, 
            nextPage
        }
    )
})

router.get('/cart', async (req, res) => {
    return res.status(200).render('cart')
})

router.get('/realTimeProducts', (req, res) => {
    res.render('realTimeProducts')
})