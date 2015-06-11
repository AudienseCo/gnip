'use strict';

var request = require('request');
var crypto = require('crypto');
var _ = require('underscore');
var fs = require('fs');
var async = require('async');

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
		fromDate: config.fromDate,
		toDate: config.toDate,
		maxResults: config.maxResults || 500,
		publisher: config.publisher || 'twitter',
		next: config.next
	};
	request.post({
		url : this._searches,
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		return cb(null, body);
	});
};


Searches.prototype.count = function(config, cb) {
	if(!config.query) return cb({error:'Query not provided'});

	var json = {
		query: config.query,
		tag: config.tag,
		fromDate: config.fromDate,
		toDate: config.toDate,
		next: config.next,
		bucket: config.bucket || 'day'		
	};
	request.post({
		url : this._counts, 
		json: json,
		headers : {'Authorization' : this._auth}
	}, function(err, response, body) {
		if(err) return cb(err);
		return cb(null, body);
	});
};

module.exports = Searches;