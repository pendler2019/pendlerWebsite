const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
	Username: { type: String,require: true},
        email : { type: String, require: true},
        Password: { type: String, require:true }
        
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
