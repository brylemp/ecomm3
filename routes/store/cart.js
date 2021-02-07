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
        res.render('./store/cart',{message:req.flash('message'),sessionId:req.sessionID,items})
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

    if(product.stock > quantity){
        if(itemExists){
            itemExists.quantity = itemExists.quantity + quantity
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
        product.stock = product.stock - quantity
        product.save()
        
        res.redirect('/cart')
    }
    else{
        req.flash('error', 'You are buying more than available stock')
        res.redirect(`/product/${req.params.id}`)
    }
    
})

module.exports = router