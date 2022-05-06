const express = require('express');
const router = express.Router();

const permissionHandler = require('../permissionHandlers/permissionHandlers')

//start of importing from passportConfig
const passportConfig = require('../passportConfig');
let signedInUsers = passportConfig.signedInUsers 
//end of importing from passportConfig

const SignedInUser = require('../classes/SignedInUserClass');
const req = require('express/lib/request');
const res = require('express/lib/response');

//start of importing from Database
const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig');//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
//end of importing from Database

router.get('/', permissionHandler.checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/myProfile.ejs', { usernameDisplay: req.user.username })
})



router.get('/updateUser', permissionHandler.checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/updateUser.ejs', { usernameDisplay: req.user.username, passwordDisplay: req.user.password, telephoneNumberDisplay: req.user.telephoneNumber })
})



router.put('/updateUser', (req, res) => {
    let infoToBeUpdated = {username: req.body.username, password: req.body.password, telephoneNumber: req.body.telephoneNumber}
    SignedInUser.UpdateUserInDatabase(req.user, infoToBeUpdated)
    
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)
    req.logOut()
    res.redirect(303, '/myProfile')
})



router.get('/deleteUser', permissionHandler.checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/deleteUser.ejs', { usernameDisplay: req.user.username })
})



router.delete('/deleteUser', (req, res) => {
    let userBeingDeleted = req.user
    SignedInUser.deleteUserFromDatabase(userBeingDeleted)
    
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)
    req.logOut()
    res.redirect('/login')
})



router.get('/myListings', permissionHandler.checkAuthenticated, (req,res) => {
    returnAllMyListingsFromDatabase(req.user.id)
    
    
    function returnAllMyListingsFromDatabase(userWhoCreatedListings){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            executeReturnAllMyListingsFromDatabase(userWhoCreatedListings)
        }); 
        connection.connect();
        allListingsInDoubleArray = []
    
        function executeReturnAllMyListingsFromDatabase(userWhoCreatedListings){
            let request = new Request(`SELECT * FROM dbo.Listings WHERE listingOwnerUserID=${userWhoCreatedListings} FOR JSON AUTO`, function(err) {
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
            allListingsInDoubleArray.push(resultParsed)
            result ="";  
            });
        
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 
    
            request.on("requestCompleted", function (rowCount, more) {
                connection.close();
                let allListingsInArray = allListingsInDoubleArray.shift()
                res.render('./myProfile/myListings/myListings.ejs', { usernameDisplay: req.user.username, listings: allListingsInArray })
            });
    
            connection.execSql(request);  
        }
    }
    
})

router.get('/myListings/:listingID', permissionHandler.checkAuthenticated,  (req, res) => {
    dataOfSelectedListingInArray = []
    
    var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
        // If no error, then good to proceed. 
        findDataOfSelectedListing()
        }); 
    connection.connect();


    function findDataOfSelectedListing(){
        let request = new Request(`SELECT * FROM dbo.Listings WHERE listingID =${req.params.listingID} FOR JSON AUTO;`, function(err) {
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
            dataOfSelectedListingParsed = JSON.parse(result);
            dataOfSelectedListingAsObject = dataOfSelectedListingParsed.shift();
            dataOfSelectedListingInArray.push(dataOfSelectedListingAsObject);      
            result ="";  
        });
    
        request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
        }); 

        request.on("requestCompleted", function (rowCount, more) {
            connection.close();
            let dataOfSelectedListingToBeSentToClient = dataOfSelectedListingInArray.shift()
            res.render('./myProfile/myListings/updateOrDeleteSelectedListing.ejs', {selectedListingData: dataOfSelectedListingToBeSentToClient})
        });

        connection.execSql(request);  
    }    
})



router.put('/myListings/:listingID', permissionHandler.checkAuthenticated, (req, res) => {
    let infoToBeUpdated = {listingTitle: req.body.listingTitle, listingDescription: req.body.listingDescription, price: req.body.price, city: req.body.city}
    SignedInUser.UpdateListingInDatabase(req.params.listingID, infoToBeUpdated)
    
    
    res.redirect(303, '/myProfile/myListings')
})



router.get('/myListings/:listingID/deleteListing', permissionHandler.checkAuthenticated, (req, res)=> {
    res.render('./myProfile/myListings/deleteListing.ejs', {idOfSelectedListing : req.params.listingID})
})



router.delete('/myListings/:listingID/deleteListing', permissionHandler.checkAuthenticated, (req, res)=>{
    SignedInUser.deleteListing(req.params.listingID)

    res.redirect('/myProfile/myListings')
})



router.get('/listingsIFollow', permissionHandler.checkAuthenticated, (req, res) => {
    listingsInDoubleArray = []
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            queryFullOuterJoinListingsAndUsers()
        }); 
        connection.connect();
        
    
        function queryFullOuterJoinListingsAndUsers(){
            let request = new Request(`SELECT L.listingTitle, L.listingDescription, L.price, L.productCondition, L.city, L.listingPictureURL
                FROM [dbo].[Listings] AS L
                JOIN [dbo].[Listings_followers] AS LF
                    ON L.listingID = LF.listingID
                WHERE LF.userID = ${req.user.id}
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
            listingsInDoubleArray.push(resultParsed)
            result ="";  
            });
        
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 
    
            request.on("requestCompleted", function (rowCount, more) {
                connection.close();
                let listingsInSingleArray = listingsInDoubleArray.shift()
                res.render('./myProfile/listingsIFollow.ejs', { listingsData: listingsInSingleArray, userSignedIn: req.user.id })
            });
    
            connection.execSql(request);  
        }
})
module.exports = router