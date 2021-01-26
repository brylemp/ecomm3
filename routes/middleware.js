exports.getOld = (req,res,next) =>{
    req.oldPrice = req.body.price
    next()
}