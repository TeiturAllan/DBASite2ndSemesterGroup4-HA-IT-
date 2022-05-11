const express = require('express');
const router = express.Router();

const permissionHandler = require('../permissionHandlers/permissionHandlers')

const SignedInAdmin = require('../classes/SignedInAdminClass')

//start of importing from database and database/queries
const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig')//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
//end of importing from database and database/queries


//is used to access the adminPage that is used to navigate to other admin related pages and methods
router.get('', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    res.render('./adminPage/adminPage.ejs', { usernameDisplay: req.user.username })//is used to show which user is signed in
})


//is used to acces the allUsers page which shows a table of all the users that are currently in the database. a link to update their information or delete the user is also shown
router.get('/allUsers', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    returnAllUsersFromDatabase()
  
    //start of returnAllUsersFromDatabase function definition
    function returnAllUsersFromDatabase(){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            executeReturnAllUsersFromDatabase()
        }); 
        connection.connect();
        allUsersInDoubleArray = []
    
        function executeReturnAllUsersFromDatabase(){
            let request = new Request(`SELECT * FROM dbo.Users FOR JSON AUTO`, function(err) {
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
            resultParsed = JSON.parse(result)
            allUsersInDoubleArray.push(resultParsed)
            result ="";  
            });
        
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 
    
            request.on("requestCompleted", function (rowCount, more) {
                connection.close();
                let allUsersInArray = allUsersInDoubleArray.shift()
                res.render('./adminPage/seeAllusers.ejs', { usernameDisplay: req.user.username /*is used to show which user is signed in*/,  tableData: allUsersInArray /*is used to send the array with the user data to the EJS file
            so that we can create a table with these users using a forEach Loop*/ })
            });
    
            connection.execSql(request);  
        }
    }
    //start of returnAllUsersFromDatabase function definition
})


//is used to access the update/delete page for the selected user
router.get('/AllUsers/:id', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    dataOfSelectedUserInArray = []
    
    var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
        // If no error, then good to proceed. 
        findDataOfSelectedUser()
        }); 
    connection.connect();


    function findDataOfSelectedUser(){
        let request = new Request(`SELECT * FROM dbo.Users WHERE id ='${req.params.id}' FOR JSON AUTO;`, function(err) {
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
            dataOfSelectedUserParsed = JSON.parse(result);
            dataOfSelectedUserAsObject = dataOfSelectedUserParsed.shift();
            dataOfSelectedUserInArray.push(dataOfSelectedUserAsObject);      
            result ="";  
        });
    
        request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
        }); 

        request.on("requestCompleted", function (rowCount, more) {
            connection.close();
            let dataOfSelectedUserToBeSentToClient = dataOfSelectedUserInArray.shift()
            res.render('./adminPage/updateOrDeleteSelectedUser.ejs', {selectedUserData: dataOfSelectedUserToBeSentToClient/*data for the selected user is sent to the EJS file to be rendered*/})
        });

        connection.execSql(request);  
    }    
})


//request used to update the user information of the selected user
router.put('/AllUsers/:id', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    let infoToBeUpdated = {username: req.body.username, password: req.body.password, telephoneNumber: req.body.telephoneNumber, goldmemberRankID: req.body.goldmemberRankID}
    let userToBeUpdated = req.params.id;
    SignedInAdmin.UpdateOtherUserInDatabase(userToBeUpdated, infoToBeUpdated)
    
    
    res.redirect(303, '/adminPage/allUsers')
})


//used to access the delete page for the selected user. this page is used prevent a user being deleted by missclick
router.get("/AllUsers/:id/deleteUser", permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    res.render('./adminPage/deleteOtherUser.ejs', {idOfUserbeingDeleted: req.params.id })
})


//this request is used when a button inside the delete user page is clicked. 
router.delete('/AllUsers/:id/deleteUser', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    SignedInAdmin.deleteOtherUserFromDatabase(req.params.id)
    
    res.redirect('/adminPage/allUsers')
})


//used to access the userStatistics page where the admin can see how many listings each individual user has and the total amount of listings on the site
router.get('/userStatistics', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res)=> {
    var connection = new Connection(dbConfig);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
        executeReturnUserStats()
        
    }); 
    connection.connect();
    allDataInDoubleArray = []
    ListingsAmountTotalInDoubleArray = []
    
    
    function executeReturnUserStats(){
        let request = new Request(`SELECT u.username, COUNT(l.listingID) AS numberOfListings
        FROM [dbo].[Users] AS u
        LEFT OUTER JOIN [dbo].[Listings] AS l
        ON u.id = l.listingOwnerUserID
        GROUP BY u.username
        ORDER BY COUNT(l.listingID) DESC
        FOR JSON PATH`, function(err) {
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
        
            resultParsed = JSON.parse(result)
            allDataInDoubleArray.push(resultParsed)
            result ="";  
        });
        
        request.on('done', function(rowCount, more) {  
        console.log(rowCount + ' rows returned');  
        }); 
    
        request.on("requestCompleted", function (rowCount, more) {
            executeTotalNumberOfListings()
        });
    
            connection.execSql(request);  
        }
        //end of executeReturnUserStats
        
        
        function executeTotalNumberOfListings(){
            let request = new Request(`SELECT COUNT(listingID) AS listingsTotal
            FROM [dbo].[Listings]
            FOR JSON AUTO`, function(err) {
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
            
                resultParsed = JSON.parse(result)
                ListingsAmountTotalInDoubleArray.push(resultParsed)
                result ="";  
            });
            
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 
        
            request.on("requestCompleted", function (rowCount, more) {
                connection.close();
                let allDataInArray = allDataInDoubleArray.shift()
                let listingTotalInArray = ListingsAmountTotalInDoubleArray.shift()
                let listingsTotal = listingTotalInArray.shift()
                res.render('./adminPage/userStatistics.ejs', { tableData: allDataInArray, listingsTotal: listingsTotal })
            });
        
                connection.execSql(request);  
            }
    
})

module.exports = router

 