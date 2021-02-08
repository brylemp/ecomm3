const express = require('express')

const productModel = require('../../models/product')
const cartModel = require('../../models/cart')
const { keyToIndex } = require('../helpers')
const { json } = require('express')

const router = express.Router()

router.get('/cart/clear', async (req,res)=>{
    delete req.session.cart 
    res.redirect('/cart')
})

router.get('/cart', async (req,res)=>{
    if(!req.session.cart){
        const cart = await cartModel.create({
            items: [],
            owner: req.sessionID
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
        res.render('./store/cart',{message:req.flash('message'),cartId:req.session.cart._id,items})
    }
})

router.post('/cart/add/:id', async (req,res)=>{
    const product = await productModel.findById(req.params.id)
    const {quantity} = req.body
    if(!req.session.cart){
        const cart = await cartModel.create({
            items: [],
            owner: req.sessionID
        })
        req.session.cart = cart
    }
    const cart = await cartModel.findOne({_id:req.session.cart._id})
    const itemExists = cart.items.find((item)=>{
        if(item.productId.toString() === req.params.id){
            return item
        }
    })

    if(product.stock >= quantity){
        if(itemExists){
            itemExists.quantity = parseInt(itemExists.quantity) + parseInt(quantity)
            req.flash('message',`Added ${quantity} more of ${product.title} to cart`)
            cart.markModified('items');
            cart.save()
        }
        else{
            const item = {
                productId: product._id,
                quantity: 1,
            }
            req.flash('message',`Added ${quantity} ${product.title} to cart`)
            cart.items.push(item)
            cart.save()
        }
        console.log(cart)
        res.redirect('/cart')
    }
    else{
        req.flash('error', 'You are buying more than available stock')
        res.redirect(`/product/${req.params.id}`)
    }
})

router.post('/cart/delete/:id', async (req,res)=>{
    const productId = req.params.id
    const cart = await cartModel.findById(req.session.cart._id)  
    const newItems = cart.items.filter(item=>{
        if(item.productId.toString()!==productId){
            return item
        }
    })
    cart.items = newItems
    cart.markModified('items');
    cart.save()
    req.flash('message', 'Removed product from cart')
    res.redirect('/cart')
})

router.put('/cart/update/:cartId/:productId', async(req,res)=>{
    const productId = req.params.productId
    console.log(productId)
    try{
        const cart = await cartModel.findById(req.params.cartId)  
        const newItems = cart.items.filter(item=>{
            if(item.productId.toString()!==productId){
                return item
            }
            else{
                item.quantity = req.body.quantity
                return item
            }
        })
        cart.items = newItems
        console.log(cart)
        cart.markModified('items');
        cart.save()
        res.json(200)
    }catch(e){
        res.json(201,{msg:e})
    }
    
})

module.exports = router