const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title:String,
    desc:String,
    img:String,
    price:Number,
    stock:{
        type:Number,
        default: 0
    }
})

module.exports = mongoose.model('product',productSchema)