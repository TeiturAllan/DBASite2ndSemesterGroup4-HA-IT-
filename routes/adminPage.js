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



router.get('', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    res.render('./adminPage/adminPage.ejs', { usernameDisplay: req.user.username })
})//figure out how to send an error message to the client if the user that is trying to access the admin page is not an admin



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
                res.render('./adminPage/seeAllusers.ejs', { usernameDisplay: req.user.username, tableData: allUsersInArray })
            });
    
            connection.execSql(request);  
        }
    }
    //start of returnAllUsersFromDatabase function definition
})



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
            res.render('./adminPage/updateOrDeleteSelectedUser.ejs', {selectedUserData: dataOfSelectedUserToBeSentToClient})
        });

        connection.execSql(request);  
    }    
})



router.put('/AllUsers/:id', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    let infoToBeUpdated = {username: req.body.username, password: req.body.password, telephoneNumber: req.body.telephoneNumber, goldmemberRankID: req.body.goldmemberRankID}
    let userToBeUpdated = req.params.id;
    SignedInAdmin.UpdateOtherUserInDatabase(userToBeUpdated, infoToBeUpdated)
    
    
    res.redirect(303, '/adminPage/allUsers')
})



router.get("/AllUsers/:id/deleteUser", permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    res.render('./adminPage/deleteOtherUser.ejs', {idOfUserbeingDeleted: req.params.id })
})



router.delete('/AllUsers/:id/deleteUser', permissionHandler.checkAuthenticated, permissionHandler.checkIfAdmin, (req, res) => {
    SignedInAdmin.deleteOtherUserFromDatabase(req.params.id)
    
    res.redirect('/adminPage/allUsers')
})



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
                console.log(listingsTotal)
                res.render('./adminPage/userStatistics.ejs', { tableData: allDataInArray, listingsTotal: listingsTotal })
            });
        
                connection.execSql(request);  
            }
    
})

module.exports = router

 