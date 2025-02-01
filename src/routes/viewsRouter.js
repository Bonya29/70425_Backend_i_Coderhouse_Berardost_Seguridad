import { Router } from 'express'
import { ProductsManager } from "../dao/productsManager.js"
import { CartsManager } from "../dao/cartsManager.js"
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

router.get('/cart/:cid', async (req, res) => {
    let {cid} = req.params
    let cart = await CartsManager.getCartByIdWithPopulate(cid)
    return res.status(200).render('cart', {products: cart.products, cid})
})

// Nota: Código en desuso
// router.get('/realTimeProducts', (req, res) => {
//     res.render('realTimeProducts')
// })