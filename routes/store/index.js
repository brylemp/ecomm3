const express = require('express')

const productModel = require('../../models/product')
const router = express.Router()

router.get('/', async (req,res)=>{
    const products = await productModel.find()

    console.log(products)
    res.render('./store/index',{products})
})

router.get('/product/:id', async (req,res)=>{
    const { id } = req.params
    const product = await productModel.findOne({_id:id})

    console.log(product)
    res.render('./store/product',{product})
})

module.exports = router