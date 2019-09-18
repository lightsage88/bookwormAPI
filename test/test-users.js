'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require('../config');


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

    describe('api/users/signup', function(){
      describe('POST', function(){
        it('Should reject users with missing username', function(){
          return chai.request(app)
          .post('/api/users/signup')
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
          .post('/api/users/signup')
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
        .post('/api/users/signup')
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
        .post('/api/users/signup')
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
    it('Should not add an already present character to the Users character array', function(){
      User.create({
        "username": "administrator",
        "characters": [{
            id: 888,
            name: "Hero-Person",
            thumbnail: {
              path: "http://www.marvelstuff.io/asdf",
              extension: "jpeg"
            }
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
          id: 888,
          thumbnail: {
            path: "sd",
            extension: "jpeg"
          }
        } 
      })
      .then((response) => {
        expect(response.body.reason).to.equal("CharacterDuplicationError");
        expect(response.body.message).to.equal('You already have this character!');
        expect(response.body.code).to.equal(422);
      })
      .catch(err => {
          if (err instanceof chai.AssertionError) {
          throw err;
          }
      })
    })

    it('should add a new character to the Users character array', ()=> {
      User.create({
        "username": "administrator",
        "characters": [{
            id: 888,
            name: "Hero-Person",
            thumbnail: {
              path: "http://www.marvelstuff.io/asdf",
              extension: "jpeg"
            }
        }],
        "password": "passwordpassword",
        "firstName": "George",
        "lastName": "Hearn"
      })
      return chai.request(app)
      .post('/api/users/addCharacter')
      .send({
        characterObject: {
          name: "Villain-Person",
          id: 666,
          thumbnail: {
            path: "sds",
            extension: "jpeg"
          }
        } 
      })
      .then((response) => {
        expect(response.body.message).to.equal('Character Added!');
        expect(response.res.statusCode).to.equal(201);
      })
      
      .catch(err => {
          if (err instanceof chai.AssertionError) {
          throw err;
          }
      });
    });
  })
  
describe('/api/users/refreshStateWithToken', ()=>{
  let usernameBank = ['Spider-Man', 'Captain America', 'Professor X'];
  const testUserName = usernameBank[Math.floor((Math.random()*usernameBank.length))];
  const createAuthToken = function(user) {
    return jwt.sign({user}, JWT_SECRET, {
        subject: String(user.username),
        expiresIn: JWT_EXPIRY,
        algorithm: 'HS256'
    });
};
const authToken = createAuthToken(testUserName);
  it('will be able to retrieve details of the account for refresh based on the jwt token generated at login/creation', () => {
    User.create({
      "username": testUserName,
      "characters": [{
          id: 888,
          name: "Hero-Person",
          thumbnail: {
            path: "sd",
            extension: "jpeg"
          }
      }],
      "authToken": authToken,
      "password": "passwordpassword",
      "firstName": "George",
      "lastName": "Hearn"
    })
    var decodedToken = jwt.verify(authToken, JWT_SECRET, (err, decoded) => {
      return decoded.user
    });
    expect(testUserName).to.equal(decodedToken);
    return chai.request(app)
    .post('/api/users/refreshStateWithToken')
    .send({
      token: authToken
    })
    .then(response => {
      expect(response.body.username).to.equal(testUserName);
      expect(response.body.firstName).to.equal('George');
    })
    .catch(err => {
      console.error(err);
      if (err instanceof chai.AssertionError) {
        throw err;
        }
    });








  })
});

  describe('api/users/deleteCharacter', ()=> {
    it('should delete a character', ()=> {
      
      let newUserRecord;
      User.create({
        "username": "administrator",
        "characters": [
          {
            id: 888,
            name: "Sweeney Todd"
          },
          {
            id: 616,
            name: "Spider-Man"
          },
          {
            id: 1989,
            name: "Super Luigi"
          }
        ],
        "password": "passwordpassword",
        "firstName": "George",
        "lastName": "Hearn"
      });
      return chai.request(app)
      .post('/api/users/deleteCharacter')
      .send({
        charID: "888",
        username: "administrator"
      })
      .then(response => {
        console.log(response.body);
        expect(response.body.characters).to.not.include("id: 888");
        expect(response.body.message).to.equal('Character Removed!');
        expect(response.status).to.equal(201);
      })
      .catch(err => {
      
        if(err instanceof chai.AssertionError) {
          throw err;
        }
      })
    })
  })
 
});