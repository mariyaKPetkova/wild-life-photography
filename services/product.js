const Product = require('../models/Products.js')

async function createProduct(productData){
    const product = new Product(productData)
    await product.save()
    return Product
}

async function getAllProducts(){
    const products = await Product.find({}).lean()
    //search
    return products
}

async function getProductById(id){
    const product = await Product.findById(id).populate('author').populate('voted').lean()
    
    return product
}

async function editProduct(id,productData){
    const product = await Product.findById(id)
    
    product.name = productData.name
    product.keyword = productData.keyword
    product.city = productData.city
    product.data = productData.data
    product.imageUrl = productData.imageUrl
    product.description = productData.description
    

    return product.save()
}
async function deleteProduct(product){
    return Product.findOneAndDelete(product)
    
}
async function voteProduct(productId,userId){
    const product = await Product.findById(productId)
    product.voted.push(userId)
    return product.save()
}


module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    editProduct,
    deleteProduct,
    voteProduct
}