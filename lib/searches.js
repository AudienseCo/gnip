'use strict';

var needle 		   = require('needle');
var crypto			 = require('crypto');
var _ 				   = require('underscore');
var fs 				   = require('fs');
var async 			 = require('async');


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
	needle.post(this._searches, json, {
		json: true,
		headers : {
			'Authorization' : this._auth,
			'Content-Type': 'application/json'
		}
	}, function(err, response) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(response.body);

		return cb(null, response.body);
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
	needle.post(this._counts, json, {
		json: true,
		headers : {
			'Authorization' : this._auth,
			'Content-Type': 'application/json'
		}
	}, function(err, response) {
		if(err) return cb(err);
		if(response.statusCode < 200 || response.statusCode >= 300) return cb(response.body);

		return cb(null, response.body);
	});
};

module.exports = Searches;