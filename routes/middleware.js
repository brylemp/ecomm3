exports.getOld = (req,res,next) =>{
    req.oldPrice = req.body.price
    next()
}

exports.isAuthenticated = (req,res,next) => {
    if(req.session.user){
        return res.redirect('/admin')
    }
    next()
}

exports.isNotAuthenticated = (req,res,next) => {
    if(!req.session.user){
        return res.redirect('/admin/login')
    }
    next()
}