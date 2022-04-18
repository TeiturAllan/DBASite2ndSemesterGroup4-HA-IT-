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



const passportConfig = require('./passportConfig')
    
passportConfig.initialize(passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)


let users = passportConfig.users


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
    var connection = new Connection(dbConfig);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.  
        console.log("Connected");  
        executeInsertUserQuery(newUser);  
    });
    connection.connect();


        function executeInsertUserQuery(insertUser){
        console.log('insertUserQuery' + insertUser)
        let request = new Request(`INSERT into dbo.Users (username, password, email, telephone_number)
            VALUES ('${insertUser.username}', '${insertUser.password}', '${insertUser.email}', ${insertUser.telephone_number});`, function(err) {
            if(err){
                console.log(err);
            }
        })
          
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                console.log("Product id of inserted item is " + column.value);  
              }  
            });  
        });

        // Close the connection after the final event emitted by the request, after the callback passes
        request.on("requestCompleted", function (rowCount, more) {
            connection.close();
        });
        connection.execSql(request);  
    } // end of function
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

//start of function definition for FindUserByEmailQueryFunction
function executeFindUserByEmailQuery(insertedEmail){
    var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            console.log("Connected");   
            FindUserByEmailQuery(insertedEmail)
        }); 
        connection.connect();
    
        function FindUserByEmailQuery(email){
            let request = new Request(`SELECT * FROM dbo.Users WHERE email = '${email}'FOR JSON AUTO`, function(err) {
                if (err){
                    console.log(err);
                }
            });
        
            var result = "";  
            request.on('row', function(columns) {  
                columns.forEach(function(column) {  
                if (column.value === null) {  
                    console.log('NULL');  
                } else {  
                    result+= column.value + " ";  
                }  
            });  
            let userSigningInArray = JSON.parse(result)
            let userSigningIn = userSigningInArray.shift()
            let loggedInUser = new SignedInUser(userSigningIn.id, userSigningIn.username, userSigningIn.password, userSigningIn.email, userSigningIn.telephone_number)
            users.push(loggedInUser)
            console.log(users)
            result ="";  
            });
            
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 
        
            request.on("requestCompleted", function (rowCount, more) {
                connection.close();
            });
            
            connection.execSql(request);  
            
        }
    }
//en of     





PORT = 3000
app.listen(PORT)
console.log(`Server is listening on port ${PORT}`)
