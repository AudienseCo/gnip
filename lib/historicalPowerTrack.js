'use strict';

var request = require('request');
var crypto = require('crypto');
var _ = require('underscore');
var fs = require('fs');
var async = require('async');

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
		fromDate: config.fromDate ? new Date(config.fromDate.toUTCString()).toFormat('YYYYMMDDHHMI') : null,
		toDate: config.toDate ? new Date(config.toDate.toUTCString()).toFormat('YYYYMMDDHHMI') : null,
		title: config.title,
		streamType: config.streamType || 'track',
		dataFormat: config.dataFormat || 'activity-streams',
		publisher: config.publisher || 'twitter'
	};

	request.post({
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