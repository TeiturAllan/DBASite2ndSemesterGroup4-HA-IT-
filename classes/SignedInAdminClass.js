const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig')
var Request = require('tedious').Request 
var TYPES = require('tedious').TYPES;

let SignedInUser = require('./SignedInUserClass')

class SignedInAdmin extends SignedInUser{
    constructor(id, adminRankID, goldmemberRankID, username, password, email, telephoneNumber){
        super(id, adminRankID, goldmemberRankID, username, password, email, telephoneNumber)
        
        
    }
    //methods 
    static UpdateOtherUserInDatabase(userBeingUpdated, infoToBeUpdated){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.  
            executeUpdateOtherUserInDatabase(userBeingUpdated, infoToBeUpdated)
        }); 
        connection.connect();

        function executeUpdateOtherUserInDatabase(idOfUserBeingUpdated, infoToBeUpdated){
            let request = new Request(`Update dbo.Users 
            SET username = '${infoToBeUpdated.username}', password = '${infoToBeUpdated.password}', telephoneNumber = ${infoToBeUpdated.telephoneNumber}, goldmemberRankID = ${infoToBeUpdated.goldmemberRankID}
            WHERE id = '${idOfUserBeingUpdated}' `, function(err) {
                if (err){
                    console.log(err);
                }
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
    
    static deleteOtherUserFromDatabase(userBeingDeleted){
        
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            console.log("Connected, and trying to delete user");   
            deleteUserQueryDefintion(userBeingDeleted)
        }); 
        connection.connect();

        function deleteUserQueryDefintion(userBeingDeleted){
            
            let request = new Request(`DELETE FROM dbo.Users WHERE id=${userBeingDeleted} `, function(err) {
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
module.exports = SignedInAdmin