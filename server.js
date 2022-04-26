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
const Connection = require('tedious').Connection;
//end of dependancies

//start of importing classes
let CreateUser = require('./classes/CreateUserClass.js')
let SignedInUser = require('./classes/SignedInUserClass')
//end of importing classes

//start of importing from database and database/queries
const dbConfig = require('./database/dbconfig')//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
//end of importing from databse and database/queries

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


app.set('view-engine', 'ejs')//sets the view engine of the server to ejs rather than HTML. this is done because it is possible to write javascript within the HTML <body> tags. EJS is layered on top of normal HTML
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get('/', checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('index.ejs', { usernameDisplay: req.user.username })//usernameDisplay is a javascript variable that is passed to the index.js file so that the client shows which user is signed in on this browser. this is possible thanks to EJS
})//this HTTP get request routes the user to '/' which is the index.js page (website homepage).



app.get('/login', checkNotAuthenticated, (req, res) => {//checkNotAuthenticated is function that is defined on line 122. passport.authenticate is middleware function from passport.js, and is used to authenticate a user '/login' which is the login.ejs file (website login page)
res.render('login.ejs')
})



app.post('/login', checkNotAuthenticated, passport.authenticate('local', {//checkNotAuthenticated is function that is defined on line 122. passport.authenticate is middleware function from passport.js, and is used to authenticate a user
    successRedirect: '/',//if user is successfully authenticated, then client is sends the '/' GET request, which loads the index.js file (website homepage)
    failureRedirect: '/login',//if user authentication fails, then user is directed back the login page
    failureFlash: true//this allows the message 'Email or password incorrect' to appear if user authentication (login) fails. message is defined on line 57 in the 'passportConfig.js' file
}))//HTTP POST request used for login. 



app.get('/register', checkNotAuthenticated, (req, res) => {//checkNotAuthenticated is function that is defined on line 122. passport.authenticate is middleware function from passport.js, and is used to authenticate a user
    res.render('register.ejs')//HTTP GET request for the register page
})

app.post('/register', checkNotAuthenticated, (req, res) => {//checkNotAuthenticated is function that is defined on line 122. passport.authenticate is middleware function from passport.js, and is used to authenticate a user
    let newUser = new CreateUser(Date.now().toString(), req.body.username, req.body.password, req.body.email, req.body.telephone_number)//a new user is created using the imported class CreateUser. Date.now().toString()is used to create the ID, because the class needs an input. the object variable is ignored when pushed to database as ID is set to autoincrement there
    res.redirect('/login')//redirects the client to the login page
    var connection = new Connection(dbConfig);  //start of code that sends the new user to the database
    connection.on('connect', function(err) { //defines what is supposed to happen when connection has been established with the database. this connection is established on line 84. definition ends on line 83
        // If no error, then good to proceed.  
        console.log("Connected");  
        executeInsertUserQuery(newUser); //execute the function that is whose definition starts on line 87 
    });
    connection.connect();//establishes a connection with the database


        function executeInsertUserQuery(insertUser){//start of function definition
        let request = new Request(`INSERT into dbo.Users (username, password, email, telephone_number)
            VALUES ('${insertUser.username}', '${insertUser.password}', '${insertUser.email}', ${insertUser.telephone_number});`, function(err) {//defines the query using the Request Class imported from Tedious.js
            if(err){
                console.log(err);
            }
        })

        
        request.on("requestCompleted", function (rowCount, more) {//defines what happens when the database tells the server that the request (query) is complete
            connection.close();//closes the connection to the database
        });
        connection.execSql(request); //sends the request which is defined on line 89 
    } // end of function definition
})



app.delete('/logout', (req, res) => {
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)//this line and the one above are used to remove the user information of the user that logged out from the signedInUsers array, as that user is no longer signed in
  

    req.logOut()//imported function from passport.js that end the user's (user the is signing out) authentication
    res.redirect('/login')//redirects user to the login page
})//app.delete request used for signing out



function checkAuthenticated(req, res, next) {//function the checks if a user is signed in on the browser, and defines what happens if a user is authenticated/signed in
    if (req.isAuthenticated()) {//if a user is signed in, then the next() function is execute
      return next()//next is a function imported from passport.js
    }
    res.redirect('/login')//sends a HTTP GET '/login' request
}



function checkNotAuthenticated(req, res, next) {//defines what happens when a user is not authenticated
    if (req.isAuthenticated()) {//if user is authenticated then the user/client is redirected to the '/' URL which is the website homepage.
      return res.redirect('/')
    }
    next()//next is a function imported from passport.js
}
/*the checkAuthenticated and checkNotAuthenticated functions are used, so only users that are authenticated can access the websites pages other than the login and register page.
they are also used to insure that if a user is signed in, then he can never access the login and register page. */ 



app.get('/myProfile', checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/myProfile.ejs', { usernameDisplay: req.user.username })
})

app.get('/myProfile/updateUser', checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/updateUser.ejs', { usernameDisplay: req.user.username, passwordDisplay: req.user.password, telephoneNumberDisplay: req.user.telephone_number })
})



app.put('/myProfile/updateUser', (req, res) => {
    let infoToBeUpdated = {username: req.body.username, password: req.body.password, telephone_Number: req.body.telephone_Number}
    SignedInUser.executeUpdateUserInDatabase(req.user, infoToBeUpdated)
    req.logOut()
    res.redirect(303, '/myProfile')
})


app.get('/myProfile/deleteUser', checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/deleteUser.ejs', { usernameDisplay: req.user.username })
})


app.delete('/myProfile/deleteUser', (req, res) => {
    let userBeingDeleted = req.user
    SignedInUser.deleteUserFromDatabase(userBeingDeleted)
    
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)
    req.logOut()
    res.redirect('/login')
})


PORT = 3000
app.listen(PORT)
console.log(`Server is listening on port ${PORT}`)
