import express from 'express'
import { engine } from 'express-handlebars'
// import { Server } from "socket.io"
import { router as productsRouter } from './routes/productsRouter.js'
import { router as cartsRouter } from './routes/cartsRouter.js'
import { router as viewsRouter } from './routes/viewsRouter.js'
const port = 8080
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./src/public'))
app.use("/api/products", productsRouter)
app.use("/api/carts", cartsRouter)
app.use("/", viewsRouter)
app.set("view engine", "handlebars")
app.set("views", "./src/views")
app.engine("handlebars", engine())

// app.get('/', (req, res) => {
//     res.status(200).send('Servidor Encendido')
// })

const server = app.listen(port, () => {
    console.log(`Server encendido en el puerto ${port} \n\nurl: http://localhost:${port}/`)
})