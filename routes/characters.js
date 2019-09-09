const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const { mPublicKey, mPrivateKey, mAPI } = require('../config');


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
    let charID = String(req.body.charID);
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
        res.json(response.data.data.results);
    })
    .catch(err => {
        res.json(err);
        console.error(err);
    });
});





module.exports = router;