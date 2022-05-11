const SignedInAdmin = require("../classes/SignedInAdminClass")

//these functions are used to deny access to users that are not allowed access certain pages/methods


function checkAuthenticated(req, res, next) {//function the checks if a user is signed in on the browser, and defines what happens if a user is authenticated/signed in
    if (req.isAuthenticated()) {//if a user is signed in, then the next() function is execute
      return next()//next is a functin in express.js
    }
    res.redirect('/login')//sends a HTTP GET '/login' request
}



function checkNotAuthenticated(req, res, next) {//defines what happens when a user is not authenticated
    if (req.isAuthenticated()) {//if user is authenticated then the user/client is redirected to the '/' URL which is the website homepage.
      return res.redirect('/')
    }
    next()//next is a functin in express.js
}


//this function is used to ensure that only admins can access certain pages/methods
function checkIfAdmin(req, res, next){
    if (req.user instanceof SignedInAdmin){
        return next()
    }
    res.redirect('/')
}


/*the checkAuthenticated and checkNotAuthenticated functions are used, so only users that are authenticated can access the websites pages other than the login and register page.
they are also used to insure that if a user is signed in, then he can never access the login and register page. */ 

module.exports = {checkAuthenticated, checkNotAuthenticated, checkIfAdmin}