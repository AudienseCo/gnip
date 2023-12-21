'use strict';

var axios 	= require('axios');
var https		= require('https');
var agent 		= new https.Agent({keepAlive:true, maxSockets:1});


require('date-utils');

var ArchiveSearches = function(archiveEndpoint, user, password) {
	this._searches = archiveEndpoint + '.json';
	this._counts = archiveEndpoint + '/counts.json';
	this._auth = "Basic " + new Buffer(user + ':' + password).toString('base64');
};


ArchiveSearches.prototype.search = function(config, cb) {
	if(!config.query) return cb({error:'Query not provided'});

	var json = {
		query: config.query,
		tag: config.tag,
		fromDate: config.fromDate ? config.fromDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		toDate: config.toDate ? config.toDate.toUTCFormat('YYYYMMDDHH24MI') : null,
		maxResults: config.maxResults || 500,
		next: config.next
	};
	axios({
		method: 'post',
		url: this._searches,
		data: json,
		headers: { 'Authorization' : this._auth },
		httpsAgent: agent
	}).then(response => {
		if (response.status < 200 || response.status >= 300) return cb(response.data);
		if (!response) return cb({error:'Void Response'});
	}).catch(err => {
		return cb(err);
	});
};

ArchiveSearches.prototype.count = function(config, cb) {
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
		headers: {'Authorization': this._auth},
		httpsAgent: agent
	}).then(function (response) {
		if(response.status < 200 || response.status >= 300) return cb(response.data);

		return cb(null, response.data);
	}).catch(function (error) {
		return cb(error);
	});
};

module.exports = ArchiveSearches;
