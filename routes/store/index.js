const express = require('express')

const productModel = require('../../models/product')
const featuredProductModel = require('../../models/featuredProduct')
const { keyToIndex } = require('../helpers')

const router = express.Router()

router.get('/', async (req,res)=>{
    const products = await productModel.find().sort({title: 1}).limit(12);
    const fproducts = await featuredProductModel.find()
    const count = await productModel.countDocuments();
    res.render('./store/index',{products,fproducts,pageNum:1,count})
})

router.get('/page/:pageNum', async (req,res)=>{
    const { pageNum } = req.params
    const products = await productModel.find().sort({title: 1}).skip(parseInt(pageNum-1)*12).limit(12);
    const fproducts = await featuredProductModel.find()
    const count = await productModel.countDocuments();
    res.render('./store/index',{products,fproducts,pageNum,count})
})

router.get('/search/', async(req,res)=>{
    const products = await productModel.find({ 'title' : { '$regex' : req.query.itemToSearch, '$options' : 'i' } }).limit(12)
    res.render('./store/search',{products})
})

router.get('/product/:id', async (req,res)=>{
    const { id } = req.params
    try{
        const product = await productModel.findOne({_id:id})
        res.render('./store/product',{error:req.flash('error'),product})
    }catch(error){
        console.log(error)
        res.redirect('/error')
    }
})

module.exports = router