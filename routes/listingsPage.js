const express = require('express');
const router = express.Router();
router.use(express.static(__dirname + 'public'));


const permissionHandler = require('../permissionHandlers/permissionHandlers')

const Listing = require('../classes/ListingClass');
const SignedInUser = require('../classes/SignedInUserClass')

//start of importing from database and database/queries
const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig');//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
//end of importing from database and database/queries



//multer is used for uploading and loading images for listings
const multer = require("multer");
const multerConfig = require('../multerConfig')

//multer is used for uploading and loading images for listings



listingsArray = []


router.get('/', permissionHandler.checkAuthenticated, (req, res) => {
    res.render('./listings/listings.ejs', { usernameDisplay: req.user.username })
})



router.get('/createNewListing', permissionHandler.checkAuthenticated, (req, res) => {
    res.render('./listings/createNewListing.ejs', { usernameDisplay: req.user.username })
})



router.post('/createNewListing', permissionHandler.checkAuthenticated, multerConfig.upload.single('image'), (req, res) => {
    let newListing = new Listing('id is created in database', req.body.listingTitle, req.body.listingDescription, req.user.id, req.user.goldmemberRankID, req.body.listingCategory, req.body.price, `../../public/${req.file.originalname}` , req.body.productConditionRankID, req.body.city, 'timestamp is created in database')
    listingsArray.push(newListing)
    SignedInUser.createListing(newListing)
    res.redirect('/listings')
})

router.get('/viewListings/:categoryID', permissionHandler.checkAuthenticated, (req, res) => {
        listingsInDoubleArray = []
        categoryID = req.params.categoryID
        let listingCategoryDisplay = listingCategoryDisplayDecider(categoryID)
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            queryFullOuterJoinListingsAndUsers()
        }); 
        connection.connect();
        
    
        function queryFullOuterJoinListingsAndUsers(){
            let request = new Request(`SELECT [dbo].[Listings].listingID, [dbo].[Listings].listingTitle, [dbo].[Listings].listingDescription, [dbo].[Users].username, [dbo].[Users].telephoneNumber, [dbo].[Users].email, [Users].goldmemberRankID, [dbo].[Listing_Categories].categoryName, [dbo].[Listings].price, [dbo].[Listings].listingPictureURL, [dbo].[Listings].productCondition, [dbo].[Listings].city, [dbo].[Listings].listingPosted
            FROM [dbo].[Listings]
            JOIN [dbo].[Users]
            ON [dbo].[Listings].listingOwnerUserID = [dbo].[Users].ID
            JOIN [dbo].[Listing_Categories]
            on [dbo].[Listings].categoryID = [dbo].[Listing_Categories].categoryID
            WHERE [dbo].[Listings].categoryID = ${categoryID}
            ORDER BY [dbo].[Users].goldmemberRankID DESC
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
                res.render('./listings/viewListings.ejs', { listingsData: listingsInSingleArray, listingCategoryDisplay: listingCategoryDisplay })
            });
    
            connection.execSql(request);  
        }
        
        //Decides what the browser should display as the shown category
    function listingCategoryDisplayDecider(categoryID){
        if(categoryID == 1){
            return 'Car'
        } if(categoryID == 2){
            return 'Truck'
        }if(categoryID == 3){
            return 'Motorcycle'
        }if(categoryID == 4){
            return 'Bicycle'
        }if(categoryID == 5){
            return 'ATV'
        }
        
    }
})



router.post('/viewListings/:listingID', permissionHandler.checkAuthenticated, (req, res) =>{
    SignedInUser.followAListing(req.user.id, req.params.listingID)
    res.send('success').status(200)
})




module.exports = router