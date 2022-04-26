const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig')
var Request = require('tedious').Request 
var TYPES = require('tedious').TYPES;

const session = require('express-session');
const passport = require('passport');
class SignedInUser{
    constructor(id, username, password, email, telephone_number){
        this.id = id,
        this.username = username,
        this.password = password,
        this.email = email,
        this.telephone_number = telephone_number
    }
    static deleteUserFromDatabase(userBeingDeleted){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            console.log("Connected");   
            deleteUserQueryDefintion(userBeingDeleted)
        }); 
        connection.connect();



        function deleteUserQueryDefintion(userBeingDeleted){
            
            let request = new Request(`DELETE FROM dbo.Users WHERE id = '${userBeingDeleted.id}' AND username ='${userBeingDeleted.username}' AND password = '${userBeingDeleted.password}'`, function(err) {
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
            console.log(result);  
            result ="";  
            });
    
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 

            request.on("requestCompleted", function (rowCount, more) {
                connection.close();
            });

            connection.execSql(request);  
        }    

    }
}

module.exports = SignedInUser