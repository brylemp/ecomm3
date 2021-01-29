const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session);
require('dotenv').config()

const authRouter = require('./routes/admin/auth')
const adminRouter = require('./routes/admin/admin')
const storeRouter = require('./routes/store/index')
const cartRouter = require('./routes/store/cart')

mongoose.connect(process.env.mongoDBURI,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false }, ()=> console.log('Connected to mongoDB'))
const app = express()
app.set('view engine','ejs')

app.use(express.static('public'))
app.use(session({
    secret: 'cat',
    store: new MongoStore({ mongooseConnection: mongoose.connection, dbName: 'sessions' }),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(authRouter)
app.use(adminRouter)
app.use(storeRouter)
app.use(cartRouter)

app.get('/error', (req,res)=> {
    res.status(404).render('./error',{msg:'404 not found'});
})

app.get('*', function(req, res){
    res.redirect('/error')
});

app.listen(3000,()=> console.log('Connected to port 3000'))