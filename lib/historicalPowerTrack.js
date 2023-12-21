'use strict';

var axios 	= require('axios');
var crypto 		= require('crypto');
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
	axios({
		method: 'post',
		url: this._jobs_uri,
		data: json,
		headers: {'Authorization' : this._auth},
		httpsAgent: agent
	}).then(response => {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	}).catch(err => {
		return cb(err);
	});
};

HistoricalPowerTrack.prototype.getJob = function(jobid, cb) {
	axios({
		method: 'get',
		url: this._job_uri.replace('#JOBID#', jobid),
		headers: {'Authorization' : this._auth},
		httpsAgent: agent
	}).then(function (response) {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	}).catch(function (error) {
		return cb(error);
	});
};

HistoricalPowerTrack.prototype.acceptJob = function(jobid, cb) {

	var json = {
		status: 'accept'
	};

	axios({
		method: 'put',
		url: this._job_uri.replace('#JOBID#', jobid),
		data: json,
		httpsAgent: agent,
		headers: {'Authorization' : this._auth}
	})
	.then(function (response) {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	})
	.catch(function (error) {
		return cb(error);
	});
};

HistoricalPowerTrack.prototype.rejectJob = function(jobid, cb) {

	var json = {
		status: 'reject'
	};

	axios({
		method: 'put',
		url: this._job_uri.replace('#JOBID#', jobid),
		data: json,
		httpsAgent: agent,
		headers: {'Authorization' : this._auth}
	})
	.then(function (response) {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	})
	.catch(function (error) {
		return cb(error);
	});

};

HistoricalPowerTrack.prototype.getResults = function(jobid, cb) {
	axios({
		method: 'get',
		url: this._results_uri.replace('#JOBID#', jobid),
		headers: {'Authorization': this._auth},
		httpsAgent: agent
	})
	.then(function (response) {
		if(response.status < 200 || response.status >= 300) {
			return cb(response.data);
		}
		return cb(null, response.data);
	})
	.catch(function (error) {
		return cb(error);
	});

};


HistoricalPowerTrack.prototype.getJobs = function(cb) {
	axios({
		httpsAgent: agent,
		url: this._jobs_uri,
		method: 'get',
		headers: {'Authorization' : this._auth}
	})
	.then(function(response) {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	})
	.catch(function(error) {
		cb(error);
	});
};

module.exports = HistoricalPowerTrack;
