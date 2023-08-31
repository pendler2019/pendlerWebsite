const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose');
var Job = new Schema({
	jobid: { type: String,index:true,require:true },
	jobrole: { type: String,require:true },
        
        description: { type: String, require:true },
        
        added_date: {
		type: Date,
		default: Date.now}
});

Job.plugin(passportLocalMongoose);

module.exports = mongoose.model('Job', Job);