const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const Feedback = new Schema({
  f_name: String,
  f_email: String,
  f_message: String,
  ip: String,
  date: Date
  });
  

Feedback.plugin(passportLocalMongoose);

module.exports = mongoose.model('FeedbackMsg', Feedback);
