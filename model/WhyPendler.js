const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const WhyPendler = new Schema({
    title: String,
    message: String,
    date:{
		type: Date,
		default: Date.now}
  });
  

  WhyPendler.plugin(passportLocalMongoose);

module.exports = mongoose.model('WhyPendler', WhyPendler);