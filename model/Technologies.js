
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Technologies = new Schema({
    name: String,
    imageUrl: String,
    sortOrder: Number,
    added_date: {type: Date,default: Date.now},
    description: {
      type: String,
      required: true
    }
		
  });

  Technologies.plugin(passportLocalMongoose);

  module.exports =mongoose.model('Technologies', Technologies);
  
