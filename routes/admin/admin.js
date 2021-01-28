const fs = require('fs');
const path = require('path');
const express = require('express')
const crypto = require('crypto')
const util = require('util')

const axios = require('axios')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const { validationResult } = require('express-validator');
const adminModel = require('../../models/admin')
const productModel = require('../../models/product')
const featuredProductModel = require('../../models/featuredProduct')
const { productValidation,stockValidation } = require('../validators')
const { getOld, isNotAuthenticated } = require('../middleware')

const scrypt = util.promisify(crypto.scrypt)
const router = express.Router()

router.get('/admin', isNotAuthenticated, async (req,res)=>{
    const products = await productModel.find()
    res.render('./admin/index',{user:req.session.user,products})
})

router.get('/admin/clearpictures', isNotAuthenticated, async (req,res)=>{
    const imagePath = path.join(__dirname, '..', '..', 'uploads');
    // const image = fs.readdirSync(imagePath);
    // console.log(image)
    fs.rmdirSync(imagePath, { recursive: true });
    res.redirect('/admin')
})

router.get('/admin/product/add', isNotAuthenticated, async (req,res)=>{
    res.render('./admin/addproduct',{add:1,details:[],errors:[]})
})

router.post('/admin/product/add', upload.single('file') ,getOld, productValidation, async (req,res)=>{
    const errors = validationResult(req);
    const details = req.body
    
    if (!errors.isEmpty()) {
        console.log(errors.mapped())
        details.price = req.oldPrice
        res.render('./admin/addproduct',{add:1,details,errors:errors.mapped()})
    }
    else{
        if(req.file){
            const imagePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
            const image = fs.readFileSync(imagePath, 'base64');
            try{
                const response = await axios({
                    method: 'post',
                    url: 'https://api.imgur.com/3/upload',
                    headers: {
                        'Authorization' :  `Bearer ${process.env.imgurAccess_token}`,
                        // 'Authorization' :  `Client-ID ${process.env.imgurClient_id}`,
                    },
                    data: {
                        image,
                        type: 'base64'
                    }
                  });
                const product = await productModel.create({ 
                    title: details.title, 
                    desc: details.desc, 
                    price: details.price, 
                    img: response.data.data.link
                })
                console.log(response.data)
            }catch(e){
                console.log(e.response.data)
            }
        }
        else{
            const product = await productModel.create({ 
                title: details.title, 
                desc: details.desc, 
                price: details.price, 
                img: details.img
            })
        }
        res.redirect('/admin')
    }
})

router.get('/admin/product/edit/:id', isNotAuthenticated, async (req,res)=>{
    const id = req.params.id
    const details = await productModel.findOne({_id:id})
    res.render('./admin/addproduct',{add:0,details,errors:[]})
})

router.post('/admin/product/edit/:id', upload.single('file'), getOld, productValidation, stockValidation, async (req,res)=>{
    const { id } = req.params
    let details = req.body
    const errors = validationResult(req);
    const product = await productModel.findById(id) 

    if (!errors.isEmpty()) {
        details.price = req.oldPrice
        details._id = product._id.toString()
        res.render('./admin/addproduct',{add:0,details,errors:errors.mapped()})
    }
    else{
        if(req.file){
            const imagePath = path.join(__dirname, '..', '..', 'uploads', req.file.filename);
            const image = fs.readFileSync(imagePath, 'base64');
            try{
                const response = await axios({
                    method: 'post',
                    url: 'https://api.imgur.com/3/upload',
                    headers: {
                        'Authorization' :  `Bearer ${process.env.imgurAccess_token}`,
                        // 'Authorization' :  `Client-ID ${process.env.imgurClient_id}`,
                    },
                    data: {
                        image,
                        type: 'base64'
                    }
                });
                product.title = details.title 
                product.desc = details.desc 
                product.price = details.price
                product.stock = details.stock
                product.img = response.data.data.link
                product.save()
                console.log(response.data)
            }catch(e){
                console.log(e.response.data)
            }
        }
        else{
            product.title = details.title 
            product.desc = details.desc 
            product.price = details.price
            product.stock = details.stock
            product.img = details.img
            product.save()
        }
        res.redirect('/admin')
    }
})

router.post('/admin/product/delete/:id', async (req,res)=>{
    const { id } = req.params
    const product = await productModel.deleteOne({_id:id})
    res.redirect('/admin')
})

router.get('/admin/product/feature/add', isNotAuthenticated, async (req,res)=>{
    const products = await productModel.find()
    const fproducts = await featuredProductModel.find()
    res.render('./admin/addfproduct',{products,fproducts})
})

router.post('/admin/product/feature/add', async (req,res)=>{
    const { productId,bannerImg } = req.body
    const product = await featuredProductModel.create({productId,bannerImg})
    res.redirect('/admin')
})

router.get('/admin/product/feature/delete/:id', isNotAuthenticated, async (req,res)=>{
    const { id } = req.params
    console.log(id)
    const fproduct = await featuredProductModel.deleteOne({_id:id})
    console.log(fproduct)
    res.redirect('/admin/product/feature/add')
})



// router.post('/admin/createaccount',async (req,res)=>{
//     const salt = crypto.randomBytes(64)
//     const key = await scrypt('123', salt.toString('base64'), 64)
//     const hashedPassword = `${key.toString('base64')}.${salt.toString('base64')}`
//     console.log(hashedPassword)
//     const user = await adminModel.create({firstName:'admin', lastName:'admin', email:'admin@admin.com',password:hashedPassword})

//     console.log(user)
// })

module.exports = router