const express = require('express')
const crypto = require('crypto')
const util = require('util')
const { check, validationResult } = require('express-validator');

const adminModel = require('../../models/admin')
const productModel = require('../../models/product')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

router.get('/admin/login', async (req,res)=>{
    if(req.session.user){
        return res.redirect('/admin')
    }
    res.render('./admin/login',{errors:'none'})
})

var loginValidation = [
    check('email').isEmail().withMessage('Not an email')
    .custom(async(email)=>{
        const user = await adminModel.findOne({email})
        if(!user){
            throw new Error('Email does not exists');
        }
    }),
    check('password')
    .custom(async(password,{req})=>{
        const user = await adminModel.findOne({email:req.body.email})
        const [hashedPassword,salt] = user.password.split('.')
        const key = await scrypt(password,salt,64)
        if(hashedPassword === key.toString('base64')){
            const newUser = user.toObject();
            delete newUser.password;
            delete newUser.__v;
            req.session.user = newUser
        }
        else{
            throw new Error('Invalid login');
        }
    })
]

router.post('/admin/login',loginValidation, async (req,res)=>{
    const errors = validationResult(req);
    const { email,password } = req.body
    const user = await adminModel.findOne({email})
    
    if (!errors.isEmpty()) {
        console.log(errors.mapped())
        res.render('./admin/login',{errors:errors.mapped()})
    }
    else{
        res.redirect('/admin')
    }
    
})

router.get('/admin/logout', async(req,res)=>{
    req.session.destroy()
    res.redirect('/')
})

module.exports = router