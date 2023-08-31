const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const Ourvalues = new Schema({
    title: String,
    imageUrl: String,
    sortOrder: Number,
    added_date: {type: Date,default: Date.now},
    description: {
      type: String,
      required: true
    }
  });
  

  Ourvalues.plugin(passportLocalMongoose);

module.exports = mongoose.model('Ourvalues', Ourvalues);
