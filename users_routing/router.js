'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRY} = require ("../config");


const {User, Character} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();
router.use(express.json());

router.post('/', jsonParser, (req,res)=>{
    console.log('delete me');
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

router.post('/addCharacter', (req,res)=> {
 let user;
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
    return User.findOne({  "username": "administrator"})
  })
  .then(_user => {
    user = _user;
    let characterId = req.body.characterObject.id;
    for(let i = 0; i < user.characters.length; i++) {
      if(characterId == user.characters[i].id) {
        return Promise.reject({
          code: 422,
          message: 'You already have this character!',
          reason: "CharacterDuplicationError"
        });
      }
    }
    return Character.create({
        description: req.body.characterObject.description || 'bocho',
        events: req.body.characterObject.events || 'lopo',
        thumbnail: req.body.characterObject.thumbnail || 'goso',
        name: req.body.characterObject.name || 'John Doe',
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
        user = _user;
        res.status(201).send(user);
    })
    .catch(err => {
        console.error(err);
    });
});



//TODO: Will need to get this to feed info from redux state on front end.
router.post('/deleteCharacter', (req, res)=> {
    let newUserCharacters
    User.findOne({"username": "administrator"})
    .then(user => {
        let characterId = Number(req.body.characterObject.id);
        newUserCharacters = (user.characters).filter(function(characterPerson) {
            return characterPerson.id !== characterId
        });
       //TODO: Stretch Goal: need to throw error if characterId to delete is not found 
       //Though nobody can delete a character twice, so it's not super vital
        user.characters = newUserCharacters;
        user.save();
        return res.status(201).json({message: "Character Removed!", characters: `${user.characters}`});
    })
    .catch(err => {
        console.error(err);
    })
})


module.exports = {router};