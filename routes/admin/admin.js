const express = require('express')
const crypto = require('crypto')
const util = require('util')

const adminModel = require('../../models/admin')
const productModel = require('../../models/product')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

router.get('/admin', async (req,res)=>{
    if(!req.session.user){
        return res.redirect('/admin/login')
    }
    const products = await productModel.find()
    res.render('./admin/index',{user:req.session.user,products})
})

router.get('/admin/product/add', async (req,res)=>{
    if(!req.session.user){
        return res.redirect('/admin/login')
    }
    
    res.render('./admin/addproduct',{user:req.session.user,details:[]})
})

router.post('/admin/product/add', async (req,res)=>{
    const { title, desc, price } = req.body
    const product = await productModel.create({ title, desc, price })
    console.log(product)
    res.redirect('/admin')
})

router.get('/admin/product/edit/:id', async (req,res)=>{
    if(!req.session.user){
        return res.redirect('/admin/login')
    }
    const id = req.params.id
    const details = await productModel.findOne({_id:id})
    console.log(details)
    res.render('./admin/addproduct',{user:req.session.user,details})
})

router.post('/admin/product/edit/:id', async (req,res)=>{
    const { id } = req.params
    const { title, desc, price, stock } = req.body
    const product = await productModel.updateOne({ _id:id }, { title, desc, price, stock })
    console.log(product)
    res.redirect('/admin')
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