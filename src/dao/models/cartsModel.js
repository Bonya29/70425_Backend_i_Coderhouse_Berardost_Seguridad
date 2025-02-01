import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    quantity: Number
})

export const cartsModel = mongoose.model(
    'carts',
    new mongoose.Schema(
        {
            products: [productSchema]
        },
        {
            timestamps: true
        }
    )
)