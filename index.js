const express = require('express')
const mongoose = require('mongoose')

const app = express()
app.set('view engine','ejs')

app.get('/',(req,res)=>{
    res.send('wew')
})

app.listen(3000,()=> console.log('Connected to port 3000'))