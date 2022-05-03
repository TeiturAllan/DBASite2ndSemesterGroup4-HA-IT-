const express = require('express');
const router = express.Router();

const CreateUserClass = require('../classes/CreateUserClass')

const permissionHandler = require('../permissionHandlers/permissionHandlers')



//start of importing from database and database/queries
const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig')//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
//end of importing from database and database/queries




router.get('', permissionHandler.checkNotAuthenticated, (req, res) => {//checkNotAuthenticated is function that is defined on line 122. passport.authenticate is middleware function from passport.js, and is used to authenticate a user
    res.render('register.ejs')//HTTP GET request for the register page
})




router.post('', permissionHandler.checkNotAuthenticated, (req, res) => {//checkNotAuthenticated is function that is defined on line 122. passport.authenticate is middleware function from passport.js, and is used to authenticate a user
    let newUser = new CreateUserClass(1, 1, req.body.username, req.body.password, req.body.email, req.body.telephoneNumber)
    //a new user is created using the imported class CreateUser. Admin_ID is set 1 one, as 1 is the Admin_ID that corresponds to a normal user
    console.log(newUser)
    res.redirect('/login')//redirects the client to the login page
    var connection = new Connection(dbConfig);  //start of code that sends the new user to the database
   
    connection.on('connect', function(err) { //defines what is supposed to happen when connection has been established with the database. this connection is established on line 84. definition ends on line 83
        // If no error, then good to proceed.  
         
        executeInsertUserQuery(newUser); //execute the function that is whose definition starts on line 87 
    });
    connection.connect();//establishes a connection with the database


        function executeInsertUserQuery(insertUser){//start of function definition
        let request = new Request(`INSERT into dbo.Users (adminRankID, goldmemberRankID, username, password, email, telephoneNumber)
            VALUES (${insertUser.adminRankID}, '${insertUser.goldmemberRankID}', '${insertUser.username}', '${insertUser.password}', '${insertUser.email}', ${insertUser.telephoneNumber});`, function(err) {//defines the query using the Request Class imported from Tedious.js
            if(err){
                console.log(err);
            }
        })
        connection.execSql(request);
        
        request.on("requestCompleted", function (rowCount, more) {//defines what happens when the database tells the server that the request (query) is complete
            connection.close();//closes the connection to the database
        });
         
    } // end of function definition
})

module.exports = router