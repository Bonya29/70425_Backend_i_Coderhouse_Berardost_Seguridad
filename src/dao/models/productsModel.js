import mongoose from 'mongoose';

export const productsModel = mongoose.model(
    'products',
    new mongoose.Schema(
        {
            id: {type: Number, unique: true},
            title: {type: String, unique: true},
            description: String,
            price: Number,
            stock: Number,
            category: String,
            code: {type: String, unique: true},
            status: Boolean
        },
        {
            timestamps: true
        }
    )
)