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

    describe('api/users', function(){
        describe('POST', function(){
            it('Should reject users with missing username', function(){
                return chai.request(app)
                .post('/api/users')
                .send({
                    password,
                    firstName,
                    lastName
                })
                .then(() =>
                    expect.fail(null, null,'Request should not succeed')
                )
                .catch(err => {
                    if (err instanceof chai.AssertionError) {
                    throw err;
                    }
                    const res = err.response;
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal('There is a field missing');
                    expect(res.body.location).to.equal('username')
                })
                
            });

            it('Should reject users with a missing password', ()=>{
                return chai.request(app)
                .post('/api/users')
                .send({
                    firstName,
                    lastName,
                    username
                })
                .then(()=> expect.fail(null, null, 'Request should not succeed'))
                .catch(err =>{
                    if(err instanceof chai.AssertionError){
                        throw err;
                    }
                    const res = err.response;
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal("There is a field missing");
                    expect(res.body.location).to.equal('password');
                })
            });

            it('Should reject users with a non-string for their firstName', ()=>{
                console.log('fuckhead');
                return chai.request(app)
                .post('/api/users')
                .send({
                    firstName: 666,
                    lastName,
                    username,
                    password
                })
                .then(()=>expect.fail(null,null, 'Request should not succeed'))
                .catch(err => {
                    const res = err.response;
                    expect(res).to.have.status(422);
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.message).to.equal('Incorrect field type: expected a string');
                    expect(res.body.location).to.equal('firstName');
                })
            });

            it('Should reject users with a non-string for their lastName', ()=>{
                return chai.request(app)
                .post('/api/users')
                .send({
                    firstName,
                    lastName: 777,
                    username,
                    password
                })
                .then(()=> expect.fail(null, null, 'Request should not succeed'))
                .catch(err => {
                    const res = err.response;
                    expect(res).to.have.status(422);
                    expect(res.body.message).to.equal('Incorrect field type: expected a string');
                    expect(res.body.reason).to.equal('ValidationError');
                    expect(res.body.location).to.equal('lastName');
                });
            });
        });
    });

    describe('/api/users/addCharacter', ()=>{

        
        
        it('Should add a non-present character to the Users character array', function(){
            User.create({
                "username": "administrator",
                "characters": [{
                    _id: 888
                }],
                "password": "passwordpassword",
                "firstName": "George",
                "lastName": "Hearn"
            })
            return chai.request(app)
            .post('/api/users/addCharacter')
            .send({
                
                    characterObject: {
                        name: "Hero-Person",
                        id: 888
                    }
                
            })
            .then((response) => {
                console.log('jojojo');
                console.log(response);
                // expect.fail(null, null,'Request should not succeed')
            })
            .catch(err => {
                if (err instanceof chai.AssertionError) {
                throw err;
                }
                const res = err.response;
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('There is a field missing');
                expect(res.body.location).to.equal('username')
            })
            
    })
    })
})