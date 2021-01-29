const express = require('express')

const productModel = require('../../models/product')
const cartModel = require('../../models/cart')
const { keyToIndex } = require('../helpers')

const router = express.Router()

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
        res.render('./store/cart',{items:[]})
    }
    else{
        const cart = await cartModel.findById(req.session.cart._id)
        let tempItems = keyToIndex('productId',cart.items)
        let ids = []
        let quantities = []
        for(let id in tempItems){
            ids.push(id)
            quantities.push(tempItems[id].quantity)
        }
        
        const items = await productModel.find().where('_id').in(ids).exec();
        for(let item of items){
            item.quantity = quantities[items.indexOf(item)]
        }
        res.render('./store/cart',{items})
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
            productId: product._id,
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