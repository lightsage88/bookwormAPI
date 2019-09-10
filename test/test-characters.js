// 'use strict';
// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const nock = require('nock');

// const jwt = require('jsonwebtoken');
// const {JWT_SECRET, JWT_EXPIRY} = require('../config');


// const {app, runServer, closeServer} = require('../server');
// const {User, Character} = require('../models');

// const {TEST_DATABASE_URL} = require('../config');

// const expect = chai.expect;
// const should = chai.should;

// chai.use(chaiHttp);

// describe('character router', ()=> {
//     before(()=>{
//         return runServer(TEST_DATABASE_URL);
//     });

//     after(()=>{
//         return closeServer();
//     });
    
//     beforeEach(()=>{

//     });

//     afterEach(()=>{
//     });

//     describe('/api/characters/search', ()=>{


//         it('is a POST request that makes a GET request to Marvels API', ()=> {
//             return chai.request(app)
//             .post('/api/characters/search')
//             .send({
//                 query: "Spider-Man"
//             })
//             .then((response) => {
//                 console.log('testing sure is fun');
//                 console.log(response.body);
//             })
//             .catch(err => {
//                 if(err instanceof chai.AssertionError) {
//                     throw err;
//                 }
//             })
//         })
//     });



// });