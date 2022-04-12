if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

//start of dependancies 
const express = require('express')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
//end of dependancies

//start of importing classes
let CreateUser = require('./classes/CreateUserClass.js')

//end of importing classes

const initializePassport = require('./passportConfig')
    initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


const users = []


app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { usernameDisplay: req.user.username })
})



app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})



app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))



app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, (req, res) => {
    let newUser = new CreateUser(Date.now().toString(), req.body.username, req.body.password, req.body.email, req.body.telephone_number)
    users.push(newUser)
    res.redirect('/login')
    console.log(users)
})



app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/login')
}



function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

PORT = 3000
app.listen(PORT)
console.log(`Server is listening on port ${PORT}`)
