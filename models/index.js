"use strict"
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');

mongoose.Promise = global.Promise;

const eventSchema = mongoose.Schema({
    title: {
        type: String
    },
    // thumbnail: { data: Buffer, contentType: String},
    thumbnail: {
        type: Object
    },
    description: {
        type: String
    }


})


const bookSchema = mongoose.Schema({
    collectionName: {
        type: String
    },
    coverImage: {
        type: String,
        //image file?

    },
    releaseDate: {
        type: String
    },
    synopsis: {
        type: String
    },
    title: {
        type: String
    }
});

const characterSchema = mongoose.Schema({
    description: {
        type:String
    },
    events: [eventSchema],
    thumbnail: {
        type: Object
        //img file??
    },
    name: {
        type: String,
        required: true
    },
    id: {
        type: Number
    },
    image: { data: Buffer, contentType: String}
});

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type:String, 
        required: true
    },
    authToken: {
        type: String
    },
    loggedIn: {
        type: Boolean
    },
    firstName: {
        type: String, 
        required: true,
        default: ''
    },
    lastName: {
        type: String, 
        required: true,
        default: ''
    },
    characters: [characterSchema],
    books: [bookSchema]

});


userSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || '',
        characters: this.characters || [],
        books: this.books || []
    };
};

userSchema.methods.validatePassword = function(passwordStringBeingPassedIn){
    return bcrypt.compare(passwordStringBeingPassedIn, this.password);
};

userSchema.statics.hashPassword = function(passwordStringBeingPassedIn){
    return bcrypt.hash(passwordStringBeingPassedIn, 10);
}



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

// eventSchema.virtual("image").get(function(){
//     axios({
//         url: `${this.thumbnail.path}.${this.thumbnail.extension}`,
//         responseType: 'stream',
//     })
//     .then(response => {
//         return new Promise((resolve, reject) => {
//             let eventPicture = response.data.pipe(fs.createWriteStream('./uploads/eventImage.jpg'));
//             eventImage.on('error', reject).on('close', resolve);
//         })
//     })
//     .catch(err => {
//         console.error(err);
//     })
// })

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);
const Character = mongoose.model("Character", characterSchema);
const Event = mongoose.model('Event', eventSchema);
module.exports = { User, Book, Character, Event };

