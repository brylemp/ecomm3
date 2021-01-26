const express = require('express')
const crypto = require('crypto')
const util = require('util')
const { validationResult } = require('express-validator');

const adminModel = require('../../models/admin')
const productModel = require('../../models/product')
const { productValidation } = require('../validators')
const { getOld, isNotAuthenticated } = require('../middleware')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

router.get('/admin', isNotAuthenticated, async (req,res)=>{
    const products = await productModel.find()
    res.render('./admin/index',{user:req.session.user,products})
})

router.get('/admin/product/add', isNotAuthenticated, async (req,res)=>{
    res.render('./admin/addproduct',{add:1,details:[],errors:[]})
})

router.post('/admin/product/add', getOld, productValidation, async (req,res)=>{
    const errors = validationResult(req);
    const details = req.body
    
    if (!errors.isEmpty()) {
        console.log(errors.mapped())
        details.price = req.oldPrice
        res.render('./admin/addproduct',{add:1,details,errors:errors.mapped()})
    }
    else{
        const { title, desc, price } = req.body
        const product = await productModel.create({ title, desc, price })
        console.log(product)
        res.redirect('/admin')
    }
})

router.get('/admin/product/edit/:id', isNotAuthenticated, async (req,res)=>{
    const id = req.params.id
    const details = await productModel.findOne({_id:id})
    res.render('./admin/addproduct',{add:0,details,errors:[]})
})

router.post('/admin/product/edit/:id', getOld, productValidation, async (req,res)=>{
    const { id } = req.params
    let details = req.body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.mapped())
        details.price = req.oldPrice
        res.render('./admin/addproduct',{add:0,details,errors:errors.mapped()})
    }
    else{
        const product = await productModel.updateOne({ _id:id }, { 
            title: details.title, 
            desc: details.desc, 
            price: details.price, 
            stock: details.stock
         })
        console.log(product)
        res.redirect('/admin')
    }
})

router.post('/admin/product/delete/:id', async (req,res)=>{
    const { id } = req.params
    const product = await productModel.deleteOne({_id:id})
    console.log(product)
    res.redirect('/admin')
})

router.post('/admin/createaccount',async (req,res)=>{
    // const salt = crypto.randomBytes(64)
    // const key = await scrypt('123', salt.toString('base64'), 64)
    // const hashedPassword = `${key.toString('base64')}.${salt.toString('base64')}`
    // console.log(hashedPassword)
    // const user = await adminModel.create({firstName:'admin', lastName:'admin', email:'admin@admin.com',password:hashedPassword})

    // console.log(user)
})

module.exports = router