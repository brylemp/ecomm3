const express = require('express')

const productModel = require('../../models/product')
const featuredProductModel = require('../../models/featuredProduct')
const cartModel = require('../../models/cart')
const { findOneAndUpdate } = require('../../models/cart')
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
        console.log(product)
        res.render('./store/product',{product})
    }catch(error){
        console.log(error)
        res.redirect('/error')
    }
})
router.get('/cart/clear', async (req,res)=>{
        delete req.session.cart 
        res.redirect('/cart')
})

router.get('/cart', async (req,res)=>{
    if(!req.session.cart){
        const cart = await cartModel.create({
            items: []
        })
        req.session.cart = cart
        res.render('./store/cart',{cart})
    }
    else{
        const cart = await cartModel.findById(req.session.cart._id)
        res.render('./store/cart',{cart})
    }
})

router.post('/cart/add/:id', async (req,res)=>{
    const product = await productModel.findById(req.params.id)
    const cart = await cartModel.findOne({_id:req.session.cart._id})
    const itemExists = cart.items.find((item)=>{
        if(item.productId.toString() === req.params.id){
            return item
        }
    })

    if(itemExists){
        itemExists.quantity++
        cart.markModified('items');
        cart.save()
    }
    else{
        const item = {
            title: product.title,
            productId: product._id,
            price: product.price,
            quantity: 1,
        }
        cart.items.push(item)
        cart.save()
    }
    product.stock--;
    product.save()
    
    // console.log(cart)
    res.redirect('/cart')
})

module.exports = router