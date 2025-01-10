import { Router } from 'express'
import { ProductsManager } from '../dao/productsManager.js'
export const router = Router()

router.get('/', async (req, res) => {
    let products = await ProductsManager.getProducts()
    res.render('home', {products})
})

// router.get('/realTimeProducts', (req, res) => {
//     let products = ProductsManager.getProducts()
//     res.render('realTimeProducts', {products})
// })