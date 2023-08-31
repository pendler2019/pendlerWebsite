const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var  About = new Schema({
  description: {
    type: String,
    required: true
  },
  image1: {
    type: String,
    required: true
  },
  image2: {
    type: String
  },
   image3: {
    type: String
  },
    title1: {
      type: String
    }, 
     icon1: {
      type: String
    }, 
    title2: {
        type: String
      }, 
    icon2: {
      type: String
    },
    title3: {
        type: String
      }, 
     icon3: {
      type: String
    },
    content1: {
      type: String
    },content2: {
      type: String
    },content3: {
      type: String
    },
    added_date: {type: Date,default: Date.now}
  
});

 About.plugin(passportLocalMongoose);

module.exports =mongoose.model(' About',  About);

