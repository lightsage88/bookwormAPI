'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');


const {app, runServer, closeServer} = require('../server');
const {User} = require('../users_routing');

const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
const should = chai.should;

chai.use(chaiHttp);

describe('/api/user', function(){
    const username = 'exampleUser';
    const password = 'examplePass';
    const firstName = 'Example';
    const lastName = 'User';
    const usernameB = 'exampleUserB';
    const passwordB = 'examplePassB';
    const firstNameB = 'ExampleB';
    const lastNameB = 'UserB';

    before(()=>{
        return runServer(TEST_DATABASE_URL);
    });

    after(()=>{
        return closeServer();
    });
    
    beforeEach(()=>{

    });

    afterEach(()=>{
        return User.deleteOne({});
    });



    describe('api/auth', function(){
        describe('LOGIN', ()=> {
            it('should throw an error if no info given to it', ()=> {
                return chai.request(app)
                .post('/api/auth/login')
                .send({

                })
                .then(()=>{
                expect.fail(null,null, 'Request should totally fail');
                })
                .catch(err => {
                if(err instanceof chai.AssertionError) {
                    throw err;
                }
                const res = err.response;
                expect(res).to.have.status(400)
                })
            });

            it('should throw a 401 error if only the username is submitted', ()=> {
                return chai.request(app)
                .post('/api/auth/login')
                .send({
                    username: "administrator",
                    password: "banana"
                })
                .then(()=>{
                    expect.fail(null,null, 'Request went fubar');
                })
                .catch(err => {
                    if(err instanceof chai.AssertionError) {
                        throw err;
                    }
                    const res = err.response;
                    expect(res).to.have.status(401);
                })
            })
        });

    
    })

    
  
});