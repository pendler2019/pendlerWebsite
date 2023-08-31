
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Services = new Schema({
  title: String, 
    name: String,
    imageUrl: String,
    sortOrder: Number,
    pageUrl: String,
    added_date: {type: Date,default: Date.now},
    description: {
      type: String,
      required: true
    }
		
  });

  Services.plugin(passportLocalMongoose);

  module.exports =mongoose.model('Services', Services);
  