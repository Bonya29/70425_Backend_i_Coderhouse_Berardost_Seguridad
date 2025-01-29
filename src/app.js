import express from 'express'
import fs from 'fs'
import path from 'path'
import { connectDB } from './utils/connDB.js'
import { engine } from 'express-handlebars'
import { Server } from "socket.io"
import { router as productsRouter } from './routes/productsRouter.js'
import { router as cartsRouter } from './routes/cartsRouter.js'
import { router as viewsRouter } from './routes/viewsRouter.js'
const port = 8080
const app = express()
const productsFilePath = path.resolve('./src/data/products.json')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./src/public'))
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/", viewsRouter)
app.set("view engine", "handlebars")
app.set("views", "./src/views")
app.engine("handlebars", engine())

const server = app.listen(port, () => {
    console.log(`Server encendido en el puerto ${port} \n\nurl: http://localhost:${port}/\n`)
})

connectDB()

const io = new Server(server)
io.on('connection', (socket) => { 
    console.log(`Se ha conectado un usuario. ID: ${socket.id}`)

    socket.emit('showProducts')

    socket.on('newProduct', (product) => {
        const data = fs.readFileSync(productsFilePath, 'utf8')
        const products = JSON.parse(data)
        products.push(product)

        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, "\t"))
        io.emit('newProduct', product)
        console.log('Se ha agregado un nuevo producto:', product)
    })

    socket.on('deleteProduct', (title) => {
        const data = fs.readFileSync(productsFilePath, 'utf8')
        let products = JSON.parse(data)
        products = products.filter(product => product.title !== title)

        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, "\t"))
        io.emit('showProducts')
        console.log(`Se ha eliminado el producto: ${title}`)
    })

    socket.on('disconnect', () => {
        console.log(`Se ha desconectado un usuario. ID: ${socket.id}`)
    })
})