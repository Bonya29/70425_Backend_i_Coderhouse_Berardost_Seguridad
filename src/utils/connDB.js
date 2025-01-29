import mongoose from 'mongoose'

export const mongoURI = "mongodb+srv://admin:qwer1234@cluster0.l57iz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&dbName=ecommerce"

export const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI)
        console.log('Base de datos de MongoDB conectada')
    } catch (error) {
        console.log(error)
    }
}