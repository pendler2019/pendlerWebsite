const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Address = new Schema({
  location: {
    type: String,
    required: true
  },address: {
    type: String,
    required: true
  },
  phone1: {
    type: String,
    required: true
  },
  phone2: {
    type: String
  },
   email: {
    type: String
  },
    facebook: {
      type: String
    },
    instagram: {
      type: String
    },
    twitter: {
      type: String
    },
     linkedin: {
      type: String
    }
  
});

Address.plugin(passportLocalMongoose);

module.exports =mongoose.model('Address', Address);

