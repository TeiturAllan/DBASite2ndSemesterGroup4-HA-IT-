const express = require('express');
const router = express.Router();

const permissionHandler = require('../permissionHandlers/permissionHandlers')

//start of importing from passportConfig
const passportConfig = require('../passportConfig');
let signedInUsers = passportConfig.signedInUsers 
//end of importing from passportConfig

const SignedInUser = require('../classes/SignedInUserClass');



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

module.exports = router