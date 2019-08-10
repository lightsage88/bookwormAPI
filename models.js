"use strict"
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    password: {type:String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    gender: {type: String, required: false},
    emailAddress: {type: String, required: true},
    phoneNumber: {type: String, required: false},
    zipCode: {type: String, required: true},
    characterChoices: [
        {
            name: String,
            image: String,
            history: String,
            comicEvents: Array
        }
    ]
});

userSchema.virtual("fullName").get(function(){
    return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.virtual("mostRecentCharacter").get(function(){
    const characterObject =
        this.characterChoices.sort((a,b)=>{
            return b.date - a.date;
        })[0] || {};
    
    return characterObject;
});

const User = mongoose.model("User", userSchema);

module.exports = { User };

