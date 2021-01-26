const express = require('express')
const crypto = require('crypto')
const util = require('util')
const { validationResult } = require('express-validator');

const adminModel = require('../../models/admin')
const productModel = require('../../models/product')
const { loginValidation } = require('../validators')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

router.get('/admin/login', async (req,res)=>{
    if(req.session.user){
        return res.redirect('/admin')
    }
    res.render('./admin/login')
})

router.post('/admin/login',loginValidation, async (req,res)=>{
    const errors = validationResult(req);
    
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