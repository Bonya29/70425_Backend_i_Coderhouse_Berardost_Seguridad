import { productsModel } from "./models/productsModel.js"

export class ProductsManager {

    static async getProducts() {
        return await productsModel.find().lean()
    }

    static async getProductByMongoId(mongoId) {
        return await productsModel.findById(mongoId).lean()
    }

    static async getProductById(pid) {
        let id = Number(pid)
        return await productsModel.findOne({id}).lean()
    }

    static async getProductsByIds(pids) {
        if (!Array.isArray(pids)) {
            pids = [Number(pids)]
        }
        return await productsModel.find({id: {$in: pids}}).lean()
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

    static async updateProduct(mongoId, product={}) {
        return await productsModel.findByIdAndUpdate(mongoId, product, {new: true}).lean()
    }

    static async deleteProduct(mongoId) {
        return await productsModel.findByIdAndDelete(mongoId).lean()
    }
}