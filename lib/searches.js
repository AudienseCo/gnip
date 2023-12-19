'use strict';

var axios 		= require('axios');
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
	axios({
		method: 'post',
		url: this._searches,
		data: json,
		httpsAgent: agent,
		headers : {'Authorization' : this._auth}
	}).then(response => {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	}).catch(err => cb(err));
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
	axios({
		method: 'post',
		url: this._counts,
		data: json,
		headers: {'Authorization' : this._auth},
		httpsAgent: agent
	})
	.then(function (response) {
		if(response.status < 200 || response.status >= 300) return cb(response.data);
		return cb(null, response.data);
	})
	.catch(function (error) {
		cb(error);
	});
};

module.exports = Searches;
