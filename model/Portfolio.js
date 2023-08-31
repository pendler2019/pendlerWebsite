const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const Portfolio = new Schema({
    client: String,
    message: String,
    date:{
		type: Date,
		default: Date.now}
  });
  

  Portfolio.plugin(passportLocalMongoose);

module.exports = mongoose.model('Portfolio', Portfolio);