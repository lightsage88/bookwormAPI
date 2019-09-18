'use strict';
const express = require('express');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require ("../config");


const {User, Character} = require('../models');

const router = express.Router();

const jsonParser = bodyParser.json();
router.use(express.json());

router.post('/signup', jsonParser, (req,res)=>{
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if(missingField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'There is a field missing',
            location: missingField
        });
    }

    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find(
        field => field in req.body && typeof req.body[field] !== 'string'
    );

    if(nonStringField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: "Incorrect field type: expected a string",
            location: nonStringField
        });
    }

    //Now we explicitly reject non trimmed values for username or password
    const explicitlyTrimmedFields = ["username", "password"];
    const nonTrimmedField = explicitlyTrimmedFields.find(field => req.body[field].trim() !== req.body[field]);

    if(nonTrimmedField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: "Cannot start or end with a whitespace",
            location: nonTrimmedField
        });
    }

    const sizedFields = {
        username: {
            min: 1
        },
        password: {
            min: 10,
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizedFields).find(
        field => 'min' in sizedFields[field] && req.body[field].trim().length < sizedFields[field].min
    );

    const tooLargeField = Object.keys(sizedFields).find(
        field => 'max' in sizedFields[field] && req.body[field].trim().length > sizedFields[field].max
    );

    if(tooSmallField || tooLargeField) {
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: tooSmallField ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
                                : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
            location: tooSmallField || tooLargeField
        });
    }

    let {username, password, firstName='', lastName=''} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username})
        .count()
        .then(count => {
            if(count > 0) {
                return Promise.reject({
                    code: 422,
                    reason: 'ValidationError',
                    message: 'Username already taken',
                    location: 'username'
                });
            }
            return User.hashPassword(password);
        })
        .then(hash => {
            return User.create({
                username,
                password: hash,
                firstName,
                lastName
            });
        })
        .then(user => {
            return res.status(201).json(user.serialize());
        })
        .catch(err => {
            if(err.reason === 'ValidationError') {
                return res.status(err.code).json(err);
            }
            res.status(500).json({code: 500, message: 'Internal Server Error'});
        });
});

//TODO : DELETE THE METHOD IMMEDIATELY BELOW BEFORE DEPLOYING!!
router.get('/', (req, res)=> {
    return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal Server Error'}));
});

const downloadImage = (url, image_path) => {
    console.log('johnny bravo, yahaha');
    axios({
        url,
        responseType: 'stream',
    })
    .then(response => 
        new Promise((resolve, reject) => {
            response.data
            .pipe(fs.createWriteStream(image_path))
            .on('finish', () => resolve())
            .on('error', e=> reject(e))
        })
    )
}




router.post('/changePassword', (req,res) => {
    let user;
    let newHash;
    const hashIt = (pwString) => {
        console.log(pwString);
        return bcrypt.hash(pwString, 10);
    }
    const compare = (pwString, hash) => {
        return bcrypt.compare(pwString, hash)
    }
    let newPW = req.body.newPW;
    let result;
    if(newPW.trim() !== newPW) {
        return res.send({
            code: 422,
            reason: 'ValidationError',
            message: "Cannot start or end with a whitespace",
        });
    }

    return User.findOne({username: req.body.username})
    .then(_user => {
        user = _user;
        return user.password;
    })
    .then(hash => {
        result = compare(req.body.oldPW, hash);
        if(!result) {
            return res.send({
                code: 422,
                reason: 'AuthenticationError',
                message: "Game recognize game, and right now you looking pretty unfamiliar"
            });
        } else {
            console.log('yippee');
            newHash = hashIt(newPW);
            
            return newHash;
            
        }
        return newHash
    })
    .then(newHash => {
        user.password = newHash;
        user.save();
        return res.send({
            code:201
        });
    })
    .catch(err => {
        console.error(err);
    })

})


router.post('/addCharacter', (req,res)=> {
 let user;
 console.log(req.body.characterObject);
 let imagePath = req.body.characterObject.thumbnail.path + '.' + req.body.characterObject.thumbnail.extension;
 let superPath = './uploads/marvelousImage.jpg';
  axios({
      url: imagePath,
      responseType: 'stream',
  })
  .then(response => {
      return new Promise((resolve, reject) => {
        let marvelousImage = response.data.pipe(fs.createWriteStream(superPath));
        marvelousImage.on('error', reject).on('close', resolve);
      })
  })
  .then(()=> {
    return User.findOne({  "username": req.body.username})
  })
  .then(_user => {
    user = _user;
    let characterId = req.body.characterObject.id;
    for(let i = 0; i < user.characters.length - 1; i++) {
      if(characterId == user.characters[i].id) {
        
        return Promise.reject({
          code: 422,
          message: 'You already have this character!',
          reason: "CharacterDuplicationError"
        });
      }
    }
    return Character.create({
        description: req.body.characterObject.description || null,
        events: req.body.characterObject.events || null,
        thumbnail: req.body.characterObject.thumbnail || null,
        name: req.body.characterObject.name || null,
        id: req.body.characterObject.id,
        "image.data": fs.readFileSync(superPath),
        "image.contentType": 'image/jpeg'
    })
  })
  .then(char => {
    console.log('lalala');
    console.log(char);
    user.characters.push(char);
    user.save();
    return res.status(201).json({message: "Character Added!"})
  })
    .catch(err => {
        console.log(err);
        if (err.reason === "CharacterDuplicationError") {
            res.send(err);
        } else {
            res.sendStatus(500);
        }
  });
});

router.post('/refreshStateWithToken', (req,res) => {
    console.log(req.body);
    let token = req.body.token;
    let username;
    let user;
    var decodedToken = jwt.verify(token, JWT_SECRET, (err, decoded) =>{
        console.log(decoded.user);
        username= decoded.user;
    } );

    User.findOne({"username":username})
    .then(_user => {
        user = _user.serialize();
        res.status(201).send(user);
    })
    .catch(err => {
        console.error(err);
    });
});



//TODO: Will need to get this to feed info from redux state on front end.
router.post('/deleteCharacter', (req, res)=> {
    let newUserCharacters
    User.findOne({"username": req.body.username})
    .then(user => {
        let characterId = req.body.charID;
        newUserCharacters = (user.characters).filter(function(characterPerson) {
            return String(characterPerson.id) !== String(characterId);
        });
       
        user.characters = newUserCharacters;
        user.save();
        return res.status(201).json({message: "Character Removed!", characters: `${user.characters}`});
    })
    
    .catch(err => {
        console.error(err);
    })
});

router.post('/deleteUser', (req,res) => {
    User.deleteOne({"username": req.body.username})
    .then(response => {
        console.log(response);
        return res.status(202).json({message: "Account Deleted"});
    });
})


module.exports = {router};