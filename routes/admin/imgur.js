const fs = require('fs');
const path = require('path');

const express = require('express')
const axios = require('axios')
const multer  = require('multer')
// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })
const upload = multer({ dest: 'uploads/' })

const router = express.Router()

router.get('/imgur', async (req,res)=>{
    res.render('./imgur')
})

router.post('/imgur', upload.single('file'), async (req,res)=>{
    console.log(req.file)
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
        console.log(response.data)
    }catch(e){
        console.log(e.response.data)
    }
    res.redirect('/imgur')
})

module.exports = router