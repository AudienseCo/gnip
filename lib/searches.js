'use strict';

var request 		= require('request');
var https			= require('https');
var agent 			= new https.Agent({keepAlive:true, maxSockets:1});


require('date-utils');

var Searches = function(searchEndpoint, user, password) {
	this._searches = searchEndpoint + '.json';
	this._counts = searchEndpoint + '/count.json';
	this._auth = "Basic " + new Buffer(user + ':' + password).toString('base64');
};


Searches.prototype.search = function(config, cb) {
	if(!config.query) return cb({error:'Query not provided'});

	var json = {
		query: config.query,
		tag: config.tag,
		fromDate: config.fromDate ? config.fromDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		toDate: config.toDate ? config.toDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		maxResults: config.maxResults || 500,
		publisher: config.publisher || 'twitter',
		next: config.next
	};
	request.post({
		agent: agent,
		url : this._searches,
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});
};


Searches.prototype.count = function(config, cb) {
	if(!config.query) return cb({error:'Query not provided'});

	var json = {
		query: config.query,
		tag: config.tag,
		fromDate: config.fromDate ? config.fromDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		toDate: config.toDate ? config.toDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		next: config.next,
		bucket: config.bucket || 'day'		
	};
	request.post({
		agent: agent,
		url : this._counts, 
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(body);

		return cb(null, body);
	});
};

module.exports = Searches;