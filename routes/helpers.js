const fs = require('fs');
const path = require('path');
const axios = require('axios')

async function imgurUpload(req,cb){
    const imagePath = path.join(__dirname, '..', 'uploads', req.file.filename);
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
        cb(response,null)
    }catch(error){ 
        cb(null,error.response.data)
    }
}

exports.imgurUpload = imgurUpload