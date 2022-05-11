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


//is used to access the myProfile page, which is used to navigate to other nested pages within the '/myProfile' path
router.get('/', permissionHandler.checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/myProfile.ejs', { usernameDisplay: req.user.username })
})


//is used to access the page where a user can update their user information
router.get('/updateUser', permissionHandler.checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/updateUser.ejs', { usernameDisplay: req.user.username, passwordDisplay: req.user.password, telephoneNumberDisplay: req.user.telephoneNumber })
})


//is used to update a users information. the infoToBeUpdated is created with user input data and the sent to the SignedInUser.UpdateUserInDatabase function along with the user's id
//after this data is sent to the database, the user is signed out, to ensure that he/she does nothing else on the website, because this could cause data inconsistancies
//after the user has been signed out he/she is free to sign in again with his/her new information
router.put('/updateUser', (req, res) => {
    let infoToBeUpdated = {username: req.body.username, password: req.body.password, telephoneNumber: req.body.telephoneNumber}
    SignedInUser.UpdateUserInDatabase(req.user, infoToBeUpdated)
    
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)
    req.logOut()
    res.redirect(303, '/myProfile')
})


//is used to access the page where a user can delete their user
router.get('/deleteUser', permissionHandler.checkAuthenticated, (req, res) => { //checkAuthenticated is a function that is defined on line 113
    res.render('./myProfile/deleteUser.ejs', { usernameDisplay: req.user.username })
})


//is used when a button in the '/myProfile/deleteUser' page is click
//this deletes a the active user from the database, and then the user is promptly signed out of the website
router.delete('/deleteUser', (req, res) => {
    let userBeingDeleted = req.user
    SignedInUser.deleteUserFromDatabase(userBeingDeleted)
    
    let indexOfUserSigningOut = signedInUsers.findIndex(obj => obj.id == req.user.id) 
    signedInUsers.splice(indexOfUserSigningOut, 1)
    req.logOut()
    res.redirect('/login')
})


//is used to access a table of the users listings
//each listing has a link to a new page where the user can update or delete the selected listing
router.get('/myListings', permissionHandler.checkAuthenticated, (req,res) => {
    
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            executeReturnAllMyListingsFromDatabase(req.user.id)
        }); 
        connection.connect();
        allListingsInDoubleArray = []
    
        function executeReturnAllMyListingsFromDatabase(userWhoCreatedListings){
            let request = new Request(`SELECT * 
            FROM dbo.Listings 
            WHERE listingOwnerUserID=${userWhoCreatedListings} FOR JSON AUTO`,
             function(err) {
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
    
)

//is used to load the page with the data of the selected listing
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


//is used to update the information/data of the selected listing
router.put('/myListings/:listingID', permissionHandler.checkAuthenticated, (req, res) => {
    let infoToBeUpdated = {listingTitle: req.body.listingTitle, listingDescription: req.body.listingDescription, price: req.body.price, city: req.body.city}
    SignedInUser.UpdateListingInDatabase(req.params.listingID, infoToBeUpdated)
    
    
    res.redirect(303, '/myProfile/myListings')
})


//is used to prevent a user from deleting a listing by missclick. a new page is loaded where the user can make sure that they want to delete the listing
router.get('/myListings/:listingID/deleteListing', permissionHandler.checkAuthenticated, (req, res)=> {
    res.render('./myProfile/myListings/deleteListing.ejs', {idOfSelectedListing : req.params.listingID})
})


//is used to delete the selected listing
router.delete('/myListings/:listingID/deleteListing', permissionHandler.checkAuthenticated, (req, res)=>{
    SignedInUser.deleteListing(req.params.listingID)

    res.redirect('/myProfile/myListings')
})


//is used to open a page with the listings that a active user has chosen to follow
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