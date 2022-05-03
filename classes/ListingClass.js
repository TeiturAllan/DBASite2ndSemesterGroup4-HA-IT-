class Listing{
    constructor(listingID, listingTitle, listingDescription, listingOwnerUserID, listingsOwnerGoldmemberRank, categoryID, price, listingPictureURL, productConditionRankID, city, listingPosted){
        this.listingID = listingID,
        this.listingTitle = listingTitle,
        this.listingDescription = listingDescription,
        this.listingOwnerUserID = listingOwnerUserID,
        this.listingsOwnerGoldmemberRank = listingsOwnerGoldmemberRank
        this.categoryID = categoryID,
        this.price = price
        this.listingPictureURL = listingPictureURL,
        this.productConditionRankID = productConditionRankID,
        this.city = city,
        this.listingPosted = listingPosted
    }
}

module.exports = Listing