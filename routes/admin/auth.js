const express = require('express')
const crypto = require('crypto')
const util = require('util')

const adminModel = require('../../models/admin')
const productModel = require('../../models/product')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

router.get('/admin', async (req,res)=>{
    const products = await productModel.find()
    res.render('./admin/index',{user:req.session.user,products})
})

router.get('/admin/login', async (req,res)=>{
    if(req.session.user){
        return res.redirect('/admin')
    }
    res.render('./admin/login')
})

router.post('/admin/login', async (req,res)=>{
    const { email,password } = req.body
    const user = await adminModel.findOne({email})
    
    if(user){
        const [hashedPassword,salt] = user.password.split('.')
        const key = await scrypt(password,salt,64)
        if(hashedPassword === key.toString('base64')){
            console.log('match')
        }
    }
    else{
        console.log('user does not exists')
    }
    const newUser = user.toObject();
    delete newUser.password;
    delete newUser.__v;
    req.session.user = newUser
    res.redirect('/admin/login')
})

router.get('/admin/logout', async(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

router.get('/admin/createaccount',async (req,res)=>{
    // const salt = crypto.randomBytes(64)
    // const key = await scrypt('123', salt.toString('base64'), 64)
    // const hashedPassword = `${key.toString('base64')}.${salt.toString('base64')}`
    // console.log(hashedPassword)
    // const user = await adminModel.create({firstName:'admin', lastName:'admin', email:'admin@admin.com',password:hashedPassword})

    // console.log(user)
    // req.session.destroy()
})

module.exports = router