if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

//start of dependancies 
const express = require('express')
const app = express();
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')



app.set('view-engine', 'ejs')//sets the view engine of the server to ejs rather than HTML. this is done because it is possible to write javascript within the HTML <body> tags. EJS is layered on top of normal HTML
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
app.use('/public', express.static('public'));


//start of importing permissionhandlers
const permissionHandler = require('./permissionHandlers/permissionHandlers')
//end of importing permissionhandlers



//start of import from passportConfig.js
const passportConfig = require('./passportConfig')   
const req = require('express/lib/request')
const res = require('express/lib/response')
passportConfig.initialize(passport,
    email => signedInUsers.find(user => user.email === email),//defines the findUserByEmail paramater in './passportConfig.js' on line 10
    id => signedInUsers.find(user => user.id === id)//defines the findUserById paramater in './passportConfig.js' on line 10
)
let signedInUsers = passportConfig.signedInUsers /*imports the signedInUsers array from './passportConfig.js' which is defined on line 8. 
Every time a user signes in, their user information is stored in this variable. Everytime a user logs out, their user info wil be deleted from the array ***deletion from array has not been implemented yet*** */

//end of import from passportConfig.js






//start of importation and use of adminPage HTTP requests
const adminPage = require('./routes/adminPage');
app.use('/adminPage', adminPage);
//end of importation and use of adminPage HTTP requests

//start of importation and use of registerPage HTTP requests
const registerPage = require('./routes/registerPage')
app.use('/register', registerPage);
//end of importation and use of registerPage HTTP requests

//start of importation and use of myProfilePage HTTP requests
const myProfilePage = require('./routes/myProfilePage')
app.use('/myProfile', myProfilePage);
//end of importation and use of myProfilePage HTTP requests

//start of importation and use of myProfilePage HTTP requests
const listingsPage = require('./routes/listingsPage')
app.use('/listings', listingsPage);
//end of importation and use of myProfilePage HTTP requests




app.get('/', permissionHandler.checkAuthenticated, (req, res) => {
    res.render('index.ejs', { usernameDisplay: req.user.username })//usernameDisplay is a javascript variable that is passed to the index.js file so that the client shows which user is signed in on this browser. this is possible thanks to EJS
})//this HTTP get request routes the user to '/' which is the index.js page (website homepage).



app.get('/login', permissionHandler.checkNotAuthenticated, (req, res) => {
res.render('login.ejs')
})



app.post('/login', permissionHandler.checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
})) 



app.delete('/logout', (req, res) => {
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)//this line and the one above are used to remove the user information of the user that logged out from the signedInUsers array, as that user is no longer signed in
  

    req.logOut()//imported function from passport.js that end the user's (user the is signing out) authentication
    res.redirect('/login')//redirects user to the login page
})//app.delete request used for signing out








PORT = 3000
app.listen(PORT)
console.log(`Server is listening on port ${PORT}`)

module.exports = app;


