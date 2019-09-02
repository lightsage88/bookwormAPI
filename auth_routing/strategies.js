'use strict';
//the export of 'Strategy' from passport-local will be named LocalStrategy
const {Strategy: LocalStrategy} = require('passport-local');


const localStrategy = new localStrategy((username, password, callback) => {
    let user;

    User.findOne({username: username})
    .then(foundUser => {
        user = foundUser;
        if(!user) {
            return Promise.reject({
                reason: 'LoginError',
                message: 'Incorrect username or password'
            });
        }
        return user.validatePassword(password);
    })
    .then(isValid => {
        if(!isValid) {
            return Promise.reject({
                reason: "LoginError",
                message: "Incorrect username or password"
            });
        }
        return callback(null, user)
    })
    .catch(err => {
        if(err.reason === 'LoginError') {
            return callback(null, false, err);
        }
        return callback(err, false)
    });
});


export default(localStrategy);

