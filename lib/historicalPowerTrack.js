'use strict';

var request 	= require('request');
var crypto 		= require('crypto');
var _ 			= require('underscore');
var fs 			= require('fs');
var async 		= require('async');
var https		= require('https');
var agent 		= new https.Agent({keepAlive:true, maxSockets:1});


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

	request.post({
		agent: agent,
		url : this._jobs_uri,
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.getJob = function(jobid, cb) {

	request({
		agent: agent,
		url : this._job_uri.replace('#JOBID#', jobid),
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
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

	request.put({
		agent: agent,
		url : this._job_uri.replace('#JOBID#', jobid),
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.rejectJob = function(jobid, cb) {

	var json = {
		status: 'reject'
	};

	request.put({
		agent: agent,
		url : this._job_uri.replace('#JOBID#', jobid),
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});

};

HistoricalPowerTrack.prototype.getResults = function(jobid, cb) {

	request({
		agent: agent,
		url : this._results_uri.replace('#JOBID#', jobid),
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
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

	request({
		agent: agent,
		url : this._jobs_uri,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
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

module.exports = HistoricalPowerTrack;