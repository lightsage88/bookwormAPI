"use strict"
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;


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
    bio: {
        type:String
    },
    image: {
        type: String
        //img file??
    },
    name: {
        type: String,
        required: true
    }
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
        characters: [],
        books: []
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

