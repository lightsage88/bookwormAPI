const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const { mPublicKey, mPrivateKey, mAPI } = require('../config');


const router = express.Router();
router.use(express.json());

router.post('/id', (req,res)=>{
    console.log('You are making a POST request to /events/id ');
    let eventID = req.body.eventID;
    let timeStamp = new Date().getTime();
    let hash = require('crypto').createHash('md5').update(timeStamp + mPrivateKey + mPublicKey).digest('hex');
    axios({
        url: `${mAPI}/events/${eventID}`,
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
    .then(response =>{
        console.log(response.data.data);
        res.json(response.data.data.results);
        //TODO: on the client side, we will want to obtain
        // description, title, end, thumbnail
    })
    .catch(err => {
        res.json(err);
        console.error(err);
    });
});


module.exports = router