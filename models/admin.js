const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    password:String
})

module.exports = mongoose.model('admin',adminSchema)