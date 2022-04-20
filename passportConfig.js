const Connection = require('tedious').Connection;
let SignedInUser = require('./classes/SignedInUserClass')
const dbConfig = require('./database/dbconfig')//importing data from dbConfig for db queries
let Request = require('tedious').Request
let TYPES = require('tedious').TYPES
const LocalStrategy = require('passport-local').Strategy

let SignedInUsers = []

function initialize(passport, getUserByEmail, getUserById) {
  
  
  const authenticateUser = (email, password, done) => {
    var connection = new Connection(dbConfig);  
      connection.on('connect', function(err) {  
          // If no error, then good to proceed.
          console.log("Connected");   
          let request = new Request(`SELECT * FROM dbo.Users WHERE email = '${email}' AND password = '${password}'FOR JSON AUTO`, function(err) {
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
        let userGoingToSignInArray = JSON.parse(result)
        let userGoingToSignIn = userGoingToSignInArray.shift()
        let userSigningIn = new SignedInUser(userGoingToSignIn.id, userGoingToSignIn.username, userGoingToSignIn.password, userGoingToSignIn.email, userGoingToSignIn.telephone_number)
        
        SignedInUsers.push(userSigningIn)
        result ="";
        });
    
        request.on('done', function(rowCount, more) {  
        console.log(rowCount + ' rows returned');
        }); 
    
        request.on("requestCompleted", function (rowCount, more) {
          authenticateUserAnswer()
          connection.close();           
        });

         
        connection.execSql(request);
        
        const authenticateUserAnswer = () => {
          const user = getUserByEmail(email)
          
          if (user == null) {
            return done(null, false, { message: 'Email and/or password incorrect' })
          } else {
            return done(null, user)
          }
        }
        
      
          
      }); 
      connection.connect();
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser((id, done) => {
    return done(null, getUserById(id))
  })
  
}

exports.initialize = initialize
exports.SignedInUsers = SignedInUsers