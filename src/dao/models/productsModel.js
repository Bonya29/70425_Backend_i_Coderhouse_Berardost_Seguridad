import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema(
    {
        id: {type: Number, unique: true},
        image: String,
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
    },
    {
        collection: 'products'
    }
)

productSchema.plugin(paginate)

export const productsModel = mongoose.model('products', productSchema)