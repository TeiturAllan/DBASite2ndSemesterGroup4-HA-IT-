const express = require('express');
const router = express.Router();



const permissionHandler = require('../permissionHandlers/permissionHandlers')

const Listing = require('../classes/ListingClass');
const SignedInUser = require('../classes/SignedInUserClass')

//start of importing from database and database/queries
const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig');//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
//end of importing from database and database/queries


listingsArray = []


router.get('/', permissionHandler.checkAuthenticated, (req, res) => {
    res.render('./listings/listings.ejs', { usernameDisplay: req.user.username })
})



router.get('/createNewListing', permissionHandler.checkAuthenticated, (req, res) => {
    res.render('./listings/createNewListing.ejs', { usernameDisplay: req.user.username })
})



router.post('/createNewListing', permissionHandler.checkAuthenticated, (req, res) => {
    let newListing = new Listing('id is created in database', req.body.listingTitle, req.body.listingDescription, req.user.id, req.user.goldmemberRankID, req.body.listingCategory, req.body.price, 'create the option to upload Images', req.body.productConditionRankID, req.body.city, 'timestamp is created in database')
    listingsArray.push(newListing)
    SignedInUser.createListing(newListing)
    res.redirect('/listings')
})




module.exports = router