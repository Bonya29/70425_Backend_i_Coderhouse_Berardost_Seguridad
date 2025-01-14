import { Router } from 'express'
export const router = Router()

router.get('/', (req, res) => {
    res.render('home')
})

router.get('/realTimeProducts', (req, res) => {
    res.render('realTimeProducts')
})