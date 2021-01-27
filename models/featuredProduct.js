const mongoose = require('mongoose')

const featuredProductSchema = new mongoose.Schema({
    productId: String,
    bannerImg: String,
})

module.exports = mongoose.model('featuredProduct',featuredProductSchema)