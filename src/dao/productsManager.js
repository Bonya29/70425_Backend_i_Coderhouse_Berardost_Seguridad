import { productsModel } from "./models/productsModel.js"

export class ProductsManager {

    static async getProducts(limit, page, query, sort) {
        return await productsModel.paginate(query,
            {
                limit,
                page,
                sort: sort,
                lean: true
            }
        )
    }

    static async getProductById(pid) {
        return await productsModel.findById(pid).lean()
    }

    static async getProductsByIds(pIds) {
        if (!Array.isArray(pIds)) {
        }
        return await productsModel.find({_id: {$in: pIds}}).lean()
    }

    static async getProductByCode(code) {
        code = code.toUpperCase().replace(/\s+/g, "")
        return await productsModel.findOne({code}).lean()
    }

    static async getProductByTitle(title) {
        title = title.toLowerCase().replace(/\s+/g, "")
        return await productsModel.findOne({
            $expr: {
                $eq: [
                    {$replaceAll: {input: {$toLower: "$title"}, find: " ", replacement: ""}},
                    title
                ]
            }
        }).lean()
    }

    static async addProduct(product={}) {
        let newProduct = await productsModel.create(product)
        return newProduct.toJSON()
    }

    static async updateProduct(pid, product={}) {
        return await productsModel.findByIdAndUpdate(pid, product, {new: true}).lean()
    }

    static async deleteProduct(pid) {
        return await productsModel.findByIdAndDelete(pid).lean()
    }
}