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




router.get('', permissionHandler.checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')//HTTP GET request for the register page
})



//is used to create a new user and the that user is sent to the database
router.post('', permissionHandler.checkNotAuthenticated, (req, res) => {
    let newUser = new CreateUserClass(1, 1, req.body.username, req.body.password, req.body.email, req.body.telephoneNumber)
    console.log(newUser)
    
    res.redirect('/login')
    
    var connection = new Connection(dbConfig);
    connection.on('connect', function(err) {   
         
        executeInsertUserQuery(newUser); 
    });
    connection.connect();

        function executeInsertUserQuery(insertUser){
        let request = new Request(`INSERT into dbo.Users (adminRankID, goldmemberRankID, username, password, email, telephoneNumber)
            VALUES (${insertUser.adminRankID}, '${insertUser.goldmemberRankID}', '${insertUser.username}', '${insertUser.password}', 
            '${insertUser.email}', ${insertUser.telephoneNumber});`, function(err) {//defines the query using the Request Class imported from Tedious.js
            if(err){
                console.log(err);
            }
        })
        connection.execSql(request);
        
        request.on("requestCompleted", function (rowCount, more) {
            connection.close();//closes the connection to the database
        });
         
    } // end of function definition
})

module.exports = router