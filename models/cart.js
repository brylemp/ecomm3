const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    items:[],
    owner: String
})

module.exports = mongoose.model('cart',cartSchema)