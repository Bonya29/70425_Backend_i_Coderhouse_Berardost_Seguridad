import mongoose from "mongoose"
import fs from "fs/promises"
import { mongoURI } from "../utils/connDB.js"
import { productsModel } from "../dao/models/productsModel.js"
import { cartsModel } from "../dao/models/cartsModel.js"

let products = []
let carts = []

const loadData = async () => {
    try {
        const productsData = await fs.readFile("./src/data/products.json", "utf-8")
        const cartsData = await fs.readFile("./src/data/carts.json", "utf-8")
        products = JSON.parse(productsData)
        carts = JSON.parse(cartsData)
    } catch (err) {
        console.error(`Error al leer los archivos JSON: ${err.message}`)
        process.exit()
    }
}

const insertData = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log('Base de datos de MongoDB conectada')

        await loadData()

        await productsModel.deleteMany()
        await cartsModel.deleteMany()

        let dataProducts = await productsModel.insertMany(products)
        let dataCarts = await cartsModel.insertMany(carts)

        console.log(`${dataProducts} \n\n${dataCarts} \n\nDatos de products y carts añadidos a la base de datos de MongoDB con exito.`)
        process.exit()
    } catch (err) {
        console.log(`Error al conectarse con el servidor de BD o al cargar los datos: ${err.message}`)
    }
}

insertData();