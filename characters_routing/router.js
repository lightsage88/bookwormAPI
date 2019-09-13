const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const { mPublicKey, mPrivateKey, mAPI } = require('../config');

const {User, Event} = require('../models');


const router = express.Router();
router.use(express.json());



router.post('/search', (req,res)=>{
    console.log('you are making POST request to characters/search');
    console.log(req.body)
    let query = req.body.query;
    let timeStamp = new Date().getTime();
    let hash = require('crypto').createHash('md5').update(timeStamp + mPrivateKey + mPublicKey).digest('hex');
    axios({
        url: `${mAPI}/characters?nameStartsWith=${query}`,
        method: "GET",
        params:{
            "apikey": `${mPublicKey}`,
            "ts": `${timeStamp}`,
            "hash": `${hash}`
        },
        headers: {
            "accept": "application/json",
        }
    })
    .then(response => {
    res.json(response.data.data.results);
    })
    .catch(err => {
        res.json(err);
        console.error(err)
    });
});

router.post('/events', (req,res)=>{
    console.log('You are making a POST request to characters/events');
    console.log(req.body);
    let username = req.body.username;
    let user;
    let charID = String(req.body.charID);
    let eventResults;
    console.log(charID);
    let timeStamp = new Date().getTime();
    let hash = require('crypto').createHash('md5').update(timeStamp + mPrivateKey + mPublicKey).digest('hex');
    axios({
        url: `${mAPI}/characters/${charID}/events`,
        method: 'GET',
        params: {
            "apikey": `${mPublicKey}`,
            "ts": `${timeStamp}`,
            "hash": `${hash}`
        },
        headers: {
            "accept": "application/json"
        }
    })
    .then(response => {
        console.log(response.data);

        //Need to find the username for the account that initiated this call
        //Need to find the character for which the call was initiated
        //Turn the response.data.data.results into what the character's events array is and save it to the User.
        // return response.data.data.results;

        // res.json(response.data.data.results);
        eventResults = response.data.data.results
    })
    .then(()=>{
        return User.findOne({"username": username})
    })
    .then(_user => {
        console.log('we should have our guy');
        user = _user;
        console.log(user);
        console.log('fogfogfog');
        let index = user.characters.findIndex((element) => {
            return String(element.id) === String(charID);
        });
        console.log(index);
        let revisedCharacter = user.characters.find((element) => {
            return String(element.id) === String(charID);
        });
        
        
        revisedCharacter.events = eventResults;
        console.log(revisedCharacter);
        let newCharacterArray = user.characters;
        newCharacterArray[index] = revisedCharacter;
        user.save();
        return res.status(201).send(user.characters);
    })

    .catch(err => {
        res.json(err);
        console.error(err);
    });
    

});





module.exports = {router}; 