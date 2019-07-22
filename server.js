
'use strict'
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');

const { mPublicKey, mPrivateKey } = require('./config');
const marvelBaseUrl = 'https://gateway.marvel.com/v1/public';

const app = express();
app.use(express.json());
    //apparently express has its own json translator
    //Lyzi said we didn't need body-parser, let's see.
    app.use((req, res, next) => {
        res.append('Access-Control-Allow-Origin', ['*']);
        res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.append('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
app.use(express.static('public'));
    //activates static asset charing, allowing us to serve HTML
    //CSS, image, etc files from a public folder hosted on the same
    //server as our app.

app.use(morgan('common'));

const logErrors =(err, req, res, next) =>{
    console.error(err);
    return res.status(500).json({Error: 'Something went terribly wrong'});
}

app.use(logErrors);

    //////////////TEMPORARY DATA////////////

const characters = [
    {
        characterName: 'Spider-Man',
        blipSurvivor: false,
        id: 0
    },
    {
        characterName: 'Iron Man',
        blipSurvivor: true,
        id: 1
    },
    {
        characterName: 'Captain America',
        blipSurvivor: true,
        id:2
    },
    {
        characterName: 'Black Panther',
        blipSurvivor: false,
        id: 3
    },
    {
        characterName: 'Nick Fury',
        blipSurvivor: false,
        id: 4
    },
    {
        characterName: 'Thor',
        blipSurvivor: true,
        id:5
    }
];


app.get('/', (req, res)=>{
   
    res.send('a okay, Ness')
    
});

app.get('/jsonResponse', (req,res) => {
    console.log(require('crypto').createHash('md5').update(Date.now() + mPrivateKey + mPublicKey).digest('hex'))
    console.log('StreetFighter');
    res.json({upcomingChampion: "Ryu"})
});

app.get('/marvel', (req, res) =>{
    let timeStamp = new Date().getTime();
    let hash = require('crypto').createHash('md5').update(timeStamp + mPrivateKey + mPublicKey).digest('hex');
    axios({
        url: `${marvelBaseUrl}/characters?nameStartsWith=Iron`,
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

})

app.get('/:id', (req,res)=>{
    const {id} = req.params;
    let requestedData;

    characters.forEach(hero =>{
        if(hero.id == id) {
           requestedData = hero
        }
    });
   
    res.json(requestedData);
})

app.post("/", (req,res) => {
    res.status(201)
    .send("a okay Snake")
})

app.listen((process.env.PORT || 8000), () => {
    console.log(`we are listening on ${process.env.PORT || 8000}`)
}); 