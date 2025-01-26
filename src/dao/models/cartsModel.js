import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    product: Number,
    quantity: Number
})

export const cartsModel = mongoose.model(
    'carts',
    new mongoose.Schema(
        {
            id: {type: Number, unique: true},
            products: [productSchema]
        },
        {
            timestamps: true
        }
    )
)