
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var JobApplicationSchema = new Schema({
  jobid:{
    type: String,
    required: true
  },
  applicant_name: {
    type: String,
    required: true
  },
  applicant_email: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  added_date: {
		type: Date,
		default: Date.now
  }
});

JobApplicationSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
