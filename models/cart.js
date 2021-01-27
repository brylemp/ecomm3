const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    items:[],
})

module.exports = mongoose.model('cart',cartSchema)