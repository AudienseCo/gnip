'use strict';

var needle 		= require('needle');
var crypto 		= require('crypto');
var _ 			= require('underscore');
var fs 			= require('fs');
var async 		= require('async');


require('date-utils');

var _JOBSUBSTRING = '/publishers/twitter/historical/track/jobs/#JOBID#';

var HistoricalPowerTrack = function(historicalEndpoint, user, password) {
	//POST, GET
	this._jobs_uri = historicalEndpoint + '/jobs.json';

	//GET, PUT
	this._job_uri = historicalEndpoint + _JOBSUBSTRING + '.json';

	//GET
	this._results_uri = historicalEndpoint + _JOBSUBSTRING + '/results.json';


	this._auth = "Basic " + new Buffer(user + ':' + password).toString('base64');
};



HistoricalPowerTrack.prototype.createJob = function(config, cb) {

	if(!config.title || config.title === '') return cb({err:'Title cannot be blank'});

	var json = {
		rules: config.rules,
		fromDate: config.fromDate ? config.fromDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		toDate: config.toDate ? config.toDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		title: config.title,
		streamType: config.streamType || 'track',
		dataFormat: config.dataFormat || 'activity-streams',
		publisher: config.publisher || 'twitter'
	};

	needle.post(this._jobs_uri, {
		body: JSON.stringify(json),
		json: true,
		headers : {'Authorization' : this._auth}
	}, function(err, body, response) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.getJob = function(jobid, cb) {

	needle.get(this._job_uri.replace('#JOBID#', jobid), {
		headers : {'Authorization' : this._auth}
	}, function(err, body, response) {
		if(err) return cb(err);

		try {
			body = JSON.parse(body);
		} catch(e) {
			return cb(e);
		}

		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.acceptJob = function(jobid, cb) {

	var json = {
		status: 'accept'
	};

	needle.put(this._job_uri.replace('#JOBID#', jobid), {
		body: JSON.stringify(json),
		json: true,
		headers : {'Authorization' : this._auth}
	}, function(err, body, response) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.rejectJob = function(jobid, cb) {

	var json = {
		status: 'reject'
	};

	needle.put(this._job_uri.replace('#JOBID#', jobid), {
		body: JSON.stringify(json),
		json: true,
		headers : {'Authorization' : this._auth}
	}, function(err, body, response) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.getResults = function(jobid, cb) {

	needle.get(this._results_uri.replace('#JOBID#', jobid), {
		headers : {'Authorization' : this._auth}
	}, function(err, body, response) {
		if(err) return cb(err);

		try {
			var body = JSON.parse(body);
		} catch(e) {
			return cb(e);
		}

		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};


HistoricalPowerTrack.prototype.getJobs = function(cb) {

	needle.get(this._jobs_uri, {
		headers : {'Authorization' : this._auth}
	}, function(err, response) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(response.body);

		return cb(null, response.body);
	});

};

module.exports = HistoricalPowerTrack;