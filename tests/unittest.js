const { expect } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../server");
chai.use(chaiHttp);


describe("register system", () => {
    describe("POST-request for register", () => {
        it("Should allow user to create user", (done) => {
            chai
            .request(app)
            .post("/register")
            .end((err, res) => {
                //A test to check for any errors
                expect(err).to.be.null;
                //A test to check for the correct status code
                expect(res.status).to.equal(200);
                //Testing if the res.body is an object
                expect(res.body).to.be.an("object");
                done();
            });
        });
    });
});
