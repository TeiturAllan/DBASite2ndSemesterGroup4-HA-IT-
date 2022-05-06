const Connection = require('tedious').Connection;
const dbConfig = require('../database/dbconfig')
var Request = require('tedious').Request 
var TYPES = require('tedious').TYPES;


const multer = require('multer')
const multerConfig = require('../multerConfig')



class SignedInUser{
    constructor(id, adminRankID, goldmemberRankID, username, password, email, telephoneNumber){
        this.id = id,
        this.adminRankID = adminRankID,
        this.goldmemberRankID = goldmemberRankID
        this.username = username,
        this.password = password,
        this.email = email,
        this.telephoneNumber = telephoneNumber
    }
    //start of deleteUserFromDatabase method
    static deleteUserFromDatabase(userBeingDeleted){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.  
            deleteUserQueryDefintion(userBeingDeleted)
        }); 
        connection.connect();

        function deleteUserQueryDefintion(userBeingDeleted){
            
            let request = new Request(`DELETE FROM dbo.Listings WHERE listingOwnerUserID = ${userBeingDeleted.id};
            DELETE FROM dbo.Users WHERE id = '${userBeingDeleted.id}' AND username ='${userBeingDeleted.username}' AND password = '${userBeingDeleted.password}';`, function(err) {
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

    } //end of deleteUserFromDatabase method



    static UpdateUserInDatabase(userBeingUpdated, infoToBeUpdated){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.  
            executeUpdateUserInDatabase(userBeingUpdated, infoToBeUpdated)
        }); 
        connection.connect();

        function executeUpdateUserInDatabase(userBeingUpdated, infoToBeUpdated){
            
            let request = new Request(`Update dbo.Users 
            SET username = '${infoToBeUpdated.username}', password = '${infoToBeUpdated.password}', telephoneNumber = ${infoToBeUpdated.telephoneNumber}
            WHERE id = '${userBeingUpdated.id}' `, function(err) {
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
    
    static createListing(createdListing){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            console.log("Connected");   
            insertCreatedListingIntoDatabase(createdListing)
        }); 
        connection.connect();


        function insertCreatedListingIntoDatabase(createdListing){
            let request = new Request(`INSERT into dbo.Listings (listingTitle, listingDescription, listingOwnerUserID, categoryID, price, listingPictureURL, productCondition, city, listingsOwnerGoldmemberRank)
                VALUES ('${createdListing.listingTitle}', '${createdListing.listingDescription}', ${createdListing.listingOwnerUserID}, '${createdListing.categoryID}', '${createdListing.price}', '${createdListing.listingPictureURL}', '${createdListing.productConditionRankID}', '${createdListing.city}', ${createdListing.listingsOwnerGoldmemberRank});`, function(err) {//defines the query using the Request Class imported from Tedious.js
                if(err){
                    console.log(err);
                }
            })
            connection.execSql(request);
            
            request.on("requestCompleted", function (rowCount, more) {//defines what happens when the database tells the server that the request (query) is complete
                connection.close();//closes the connection to the database
            });
             
        }
            
    }

    static UpdateListingInDatabase(listingBeingUpdated, infoToBeUpdated){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.  
            executeUpdateListingInDatabase(listingBeingUpdated, infoToBeUpdated)
        }); 
        connection.connect();

        function executeUpdateListingInDatabase(listingBeingUpdated, infoToBeUpdated){
            
            let request = new Request(`Update dbo.Listings 
            SET listingTitle = '${infoToBeUpdated.listingTitle}', listingDescription = '${infoToBeUpdated.listingDescription}', price = ${infoToBeUpdated.price}, city = '${infoToBeUpdated.city}'
            WHERE listingID = '${listingBeingUpdated}' `, function(err) {
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

    static deleteListing(listingID){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.  
            executeDeleteListing(listingID)
        }); 
        connection.connect();

        function executeDeleteListing(listingID){
            
            let request = new Request(`DELETE FROM dbo.Listings where listingID = ${listingID};`, function(err) {
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
    
    static followAListing(userId, listingID){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.
            console.log("Connected");   
            executeFollowAListing(userId, listingID)
        }); 
        connection.connect();
        
        
        function executeFollowAListing(userId, listingID){
            let request = new Request(`INSERT INTO dbo.Listings_followers(userID, listingID)
            VALUES( ${userId}, ${listingID})`, function(err) {
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

    