const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');

const Mission_Team = new Schema({
    we_offer: String,
    mission: String,
    team: String,
    date:{
		type: Date,
		default: Date.now}
  });
  

  Mission_Team.plugin(passportLocalMongoose);

module.exports = mongoose.model('Mission_Team', Mission_Team);