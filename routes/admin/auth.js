const express = require('express')
const crypto = require('crypto')
const util = require('util')

const adminModel = require('../../models/admin')
const productModel = require('../../models/product')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

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

module.exports = router