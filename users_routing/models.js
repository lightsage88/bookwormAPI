"use strict"
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const crossoverEventSchema = mongoose.Schema({
    eventName: {
        type: String
    },
    image: { data: Buffer, contentType: String},
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
    events: {
      type: Object  
    },
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
    crossoverEvents: [crossoverEventSchema],
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

const User = mongoose.model("User", userSchema);
const Book = mongoose.model("Book", bookSchema);
const Character = mongoose.model("Character", characterSchema);

module.exports = { User, Book, Character };

