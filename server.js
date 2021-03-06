
'use strict'
require('dotenv').config();
const mongoose = require('mongoose');
var multer = require('multer');
const express = require('express');
const passport = require('passport');
const morgan = require('morgan');
const cors = require('cors');
const {router: usersRouter} = require('./users_routing');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth_routing');
const {router: charactersRouter} = require('./characters_routing');
const eventsRouter = require('./routes/events');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
const {PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRY} = require ("./config");

const app = express();
app.use(express.json());
app.use(cors());
    
app.use(express.static('public'));
    //activates static asset charing, allowing us to serve HTML
    //CSS, image, etc files from a public folder hosted on the same
    //server as our app.
passport.use(localStrategy);
passport.use(jwtStrategy);
app.use(morgan('common'));

app.use(multer({dest:'./uploads/'}).single('photo'));


app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/characters', charactersRouter);
app.use('/api/events', eventsRouter);

const logErrors =(err, req, res, next) =>{
    console.error(err);
    return res.status(500).json({Error: 'Something went terribly wrong'});
}

app.use(logErrors);



let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject)=>{
        mongoose.connect(
            databaseUrl,
            {useNewUrlParser: true},
            err => {
                if(err) {
                    return reject(err);
                }
                server = app
                .listen(port, ()=>{
                    console.log(`your app is listening on port ${port}`);
                    resolve();
                })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

function closeServer() {
    return mongoose.disconnect().then(()=>{
        return new Promise((resolve, reject) =>{
            console.log("closing the server");
            server.close(err => {
                if(err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if(require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};

// app.listen((process.env.PORT || 8000), () => {
//     console.log(`we are listening on ${process.env.PORT || 8000}`)
// }); 