const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig')
var Request = require('tedious').Request 
var TYPES = require('tedious').TYPES;

let SignedInUser = require('./SignedInUserClass')

/*the constructors are the same as in the SignedInUser class. The difference is defined in the database. 
if the users adminRankID is 1, then he is a normal user (SignedInUser) if the adminRankID is 2 or higher, then the user is an admin
in this case the we will only use adminRankID = 2 to define admins, even if there are two admins, as this is the admin Rank and not the admin ID
if we wish to create a new admin Rank (e.g. Site Owner) then we can use the higher numbers*/
class SignedInAdmin extends SignedInUser{
    constructor(id, adminRankID, goldmemberRankID, username, password, email, telephoneNumber){
        super(id, adminRankID, goldmemberRankID, username, password, email, telephoneNumber)
        
        
    }
    //methods 

    //start of UpdateOtherUserInDatabase function definition
    /*UpdateOtherUserInDatabase uses two parameters.
    userBeingUpdated is the id of the userbeing updated. this id is collected using req.params.id in the '/adminPage/AllUsers/:id' PUT request
    infoToBeUpdated is an object created from the user inputs from the browser during the same PUT request
    these to paramaters are inserted into the query that is sent to the database*/
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
    //end of UpdateOtherUserInDatabase function definition



    //start of deleteOtherUserFromDatabase function definition
      /*deleteOtherUserFromDatabase uses one parameter.
    userBeingDeleted is the id of the userbeing deleted. this id is collected using req.params.id in the '/ adminPage/AllUsers/:id/deleteUser delete request
    this parameter is used in two queries that are sent to the database right after each other. the first query deletes the listings of the user being deleted.
    the reason for this query being sent first, is that the database sends an error if the query order was the other way around.
    the reason for this error message is, that the listings table uses "id" in the users table as foreign key, and therefor the listings need to be delete first.

    when the query that deletes the listings is finished, then the next query is sent. this query finally deletes the user from the database 
    */
    static deleteOtherUserFromDatabase(userBeingDeleted){
        
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            console.log("Connected, and trying to delete user");   
            deleteListingOfUserBeingDelete(userBeingDeleted)
        }); 
        connection.connect();

        function deleteListingOfUserBeingDelete(userBeingDeleted){
            let request = new Request(`DELETE FROM dbo.listings WHERE listingOwnerUserID =${userBeingDeleted} `, function(err) {
                if (err){
                    console.log(err);
                }
            });
    
            
            request.on('done', function(rowCount, more) {  
            console.log(rowCount + ' rows returned');  
            }); 
        
            request.on("requestCompleted", function (rowCount, more) {
                deleteUserQueryDefintion(userBeingDeleted)
            });
        
            connection.execSql(request);  
        }
       
        function deleteUserQueryDefintion(userBeingDeleted){
            
            let request = new Request(`DELETE FROM dbo.Users WHERE id=${userBeingDeleted} `, function(err) {
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

    }//end of deleteUserQueryDefintion function definition
}
module.exports = SignedInAdmin