const { check } = require('express-validator');
const adminModel = require('../models/admin')
const crypto = require('crypto')
const util = require('util')

const scrypt = util.promisify(crypto.scrypt)

exports.loginValidation = [
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
        if(!user){
            throw new Error(' ');
        }
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

exports.productValidation = [
    check('title').isLength({min:5, max:20}).withMessage('Title must be 5-20 characters long'),
    check('desc').isLength({min:5, max:200}).withMessage('Description must be 5-200 characters long'),
    check('price').toFloat().isFloat().withMessage('Price must be a number'),
]

exports.stockValidation = [
    check('stock').isInt({min:0,max:100}).withMessage('Stock must be a number from 0-100')
]
