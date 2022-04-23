//can't get this function to work properly when exported, so it is coded directly into the server.js file. the code is inside the HTTP POST request that starts on line 76 


const Connection = require('tedious').Connection;
const dbConfig = require('../dbconfig')
var Request = require('tedious').Request  
    var TYPES = require('tedious').TYPES;

    
    var connection = new Connection(dbConfig);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.  
        console.log("Connected");  
        executeInsertUserQuery(importingUser);  
    });

    function executeInsertUserQuery(insertUser){
        console.log('insertUserQuery' + insertUser)
        let request = new Request(`INSERT into dbo.Users (username, password, email, telephone_number)
            VALUES ('${insertUser.username}', '${insertUser.password}', '${insertUser.email}', ${insertUser.telephone_number});`, function(err) {
            if(err){
                console.log(err);
            }
        })
          
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                console.log("Product id of inserted item is " + column.value);  
              }  
            });  
        });

        // Close the connection after the final event emitted by the request, after the callback passes
        request.on("requestCompleted", function (rowCount, more) {
            connection.close();
        });
        connection.execSql(request);  
    } // end of function

module.exports = InsertUserQuery()