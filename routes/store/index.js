const express = require('express')

const productModel = require('../../models/product')
const featuredProductModel = require('../../models/featuredProduct')
const { keyToIndex } = require('../helpers')

const router = express.Router()

router.get('/', async (req,res)=>{
    const products = await productModel.find()
    const fproducts = await featuredProductModel.find()
    res.render('./store/index',{products,fproducts})
})

router.get('/product/:id', async (req,res)=>{
    const { id } = req.params
    try{
        const product = await productModel.findOne({_id:id})
        res.render('./store/product',{product})
    }catch(error){
        console.log(error)
        res.redirect('/error')
    }
})

module.exports = router