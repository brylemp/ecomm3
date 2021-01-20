const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session);
require('dotenv').config()

const authRouter = require('./routes/admin/auth')
const adminRouter = require('./routes/admin/admin')

mongoose.connect(process.env.mongoDBURI,{ useNewUrlParser: true,useUnifiedTopology: true }, ()=> console.log('Connected to mongoDB'))
const app = express()
app.set('view engine','ejs')

app.use(session({
    secret: 'cat',
    store: new MongoStore({ mongooseConnection: mongoose.connection, dbName: 'sessions' }),
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(express.urlencoded({extended:true}))
app.use(authRouter)
app.use(adminRouter)

app.get('/',(req,res)=>{
    res.send('wew')
})

app.listen(3000,()=> console.log('Connected to port 3000'))