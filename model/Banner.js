
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Banner = new Schema({
    name: String,
    imageUrl: String,
    sortOrder: Number,
    added_date: {type: Date,default: Date.now},
    description: {
      type: String,
      required: true
    }
		
  });

  Banner.plugin(passportLocalMongoose);

  module.exports =mongoose.model('Banner', Banner);
  