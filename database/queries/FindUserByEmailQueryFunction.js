const Connection = require('tedious').Connection;
const dbConfig = require('../dbconfig')
var Request = require('tedious').Request  
    var TYPES = require('tedious').TYPES;

let users = []


function executeFindUserByEmailQuery(insertedEmail){
var connection = new Connection(dbConfig);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
        console.log("Connected");   
        FindUserByEmailQuery(insertedEmail)
    }); 
    connection.connect();

    function FindUserByEmailQuery(email){
        let request = new Request(`SELECT * FROM dbo.Users WHERE email = '${email}'FOR JSON AUTO`, function(err) {
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
        users.push(result)  
        result ="";  
        });
        
        request.on('done', function(rowCount, more) {  
        console.log(rowCount + ' rows returned');  
        }); 
    
        request.on("requestCompleted", function (rowCount, more) {
            connection.close();
        });
        
        connection.execSql(request);  
        console.log(users)
    }
}

module.exports = executeFindUserByEmailQuery(insertedEmail)