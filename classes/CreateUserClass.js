class CreateUser{
    constructor(adminRankID, goldmemberRankID, username, password, email, telephoneNumber){
        this.adminRankID = adminRankID,
        this.goldmemberRankID = goldmemberRankID
        this.username = username,
        this.password = password,
        this.email = email,
        this.telephoneNumber = telephoneNumber
    }
}

module.exports = CreateUser