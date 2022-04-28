const Connection = require('tedious').Connection;
const dbConfig = require('../dbconfig')
var Request = require('tedious').Request  
var TYPES = require('tedious').TYPES;

function returnAllUsersFromDatabase(){
    var connection = new Connection(dbConfig);  
    connection.on('connect', function(err) {  
        // If no error, then good to proceed.
        console.log("Connected");   
        executeReturnAllUsersFromDatabase()
    }); 
    connection.connect();


    function executeReturnAllUsersFromDatabase(){
        let request = new Request(`SELECT * FROM dbo.Users FOR JSON AUTO`, function(err) {
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
        //console.log(result)
        let allUsers = result;  
        //result ="";  
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

module.exports = returnAllUsersFromDatabase