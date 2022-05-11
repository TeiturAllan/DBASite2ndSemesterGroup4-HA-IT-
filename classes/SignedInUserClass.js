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
    /* deleteUserFromDatabase function takes a variable from the '/myProfile/deleteUser' DELETE Request.
    this variable is the information of the user that is currently signed in. this information is then used
    as inputs in the query that is sent to the database*/

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


    //start of updateUserInDatabase function definition

    /*updateUserInDatabase takes two inputs from the '/myProfile/updateUser' PUT request.
    these inputs are the id of the user going to be updated and an object which contains the data that the user has inserted in the browser.
    the data from the user is what the user wants the new user information to be in the database

    these two inputs (userBeingUpdated and infoToBeUpdated) are then inserted into the query that starts on line 76*/

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
    //end of updateUserInDatabase function definition
    

    //start of createListing function definition
    /* the createListing function takes an object as a paramater. this object is defined in the '/listings/createNewListing' POST Request.
    this object is created with data insert by the user in the browser.
    the object elements are then inserted into the query that is sent to the database. This query's defintion starts on line 113.
    */
    static createListing(createdListing){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed.  
            insertCreatedListingIntoDatabase(createdListing)
        }); 
        connection.connect();


        function insertCreatedListingIntoDatabase(createdListing){
            let request = new Request(`INSERT into dbo.Listings (listingTitle, listingDescription, listingOwnerUserID, categoryID, price, listingPictureURL, productCondition, city, listingPosted, listingsOwnerGoldmemberRank)
                VALUES ('${createdListing.listingTitle}', '${createdListing.listingDescription}', ${createdListing.listingOwnerUserID}, '${createdListing.categoryID}', '${createdListing.price}', '${createdListing.listingPictureURL}', '${createdListing.productConditionRankID}', '${createdListing.city}', '${createdListing.listingPosted}', ${createdListing.listingsOwnerGoldmemberRank});`, function(err) {//defines the query using the Request Class imported from Tedious.js
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
    //end of createListing function definition
    
    
    //start of UpdateListingInDatabase function definition
    /*the UpdateListingInDatabase function takes two paramaters. 
    the first paramater is the id of the listing that is being updated which is accessed using req.params.listingID in the '/myProfile/myListings/:listingID' PUT request
    the second paramater is an object that is created during the same PUT request. the information comes from the user inputs in the browser
    these two paramaters are then inserted into query that is sent to the database
    */
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
    //end of UpdateListingInDatabase function definition
    
    
    //start of deleteListing function definition
    /* deleteListing function uses one parameter. This paramater is defined as req.params.listingsID in the '/myProfile/myListings/:listingID/deleteListing' DELETE Request
    the paramater is then inserted into the query that is sent to the database*/
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
    //end of deleteListing function definition
    

    //start of followAListing function definition
    /*followAListing uses two parameters. 
    the userId paramater is the id of the user that is currently signed in
    the listingsID parameter is the id of the listing that is being followed. this id defined using req.params.listingID in the '/listings/viewListings/:listingID' POST request
    these two paramaters are then inserted into the query that is then sent to the database
    */
    static followAListing(userId, listingID){
        var connection = new Connection(dbConfig);  
        connection.on('connect', function(err) {  
            // If no error, then good to proceed. 
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
    //end of followAListing function definition
}

module.exports = SignedInUser

    