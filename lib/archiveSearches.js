'use strict';

var request = require('request');
var crypto = require('crypto');
var _ = require('underscore');
var fs = require('fs');
var async = require('async');

require('date-utils');

var ArchiveSearches = function(archiveEndpoint, user, password) {
	this._searches = archiveEndpoint + '.json';
	this._counts = archiveEndpoint + '/count.json';
	this._auth = "Basic " + new Buffer(user + ':' + password).toString('base64');
};


ArchiveSearches.prototype.search = function(config, cb) {
	if(!config.query) return cb({error:'Query not provided'});

	var json = {
		query: config.query,
		tag: config.tag,
		fromDate: config.fromDate ? new Date(config.fromDate.toUTCString()).toFormat('YYYYMMDDHHMI') : null,
		toDate: config.toDate ? new Date(config.toDate.toUTCString()).toFormat('YYYYMMDDHHMI') : null,
		maxResults: config.maxResults || 500,
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


ArchiveSearches.prototype.count = function(config, cb) {
	if(!config.query) return cb({error:'Query not provided'});

	var json = {
		query: config.query,
		tag: config.tag,
		fromDate: config.fromDate ? new Date(config.fromDate.toUTCString()).toFormat('YYYYMMDDHHMI') : null,
		toDate: config.toDate ? new Date(config.toDate.toUTCString()).toFormat('YYYYMMDDHHMI') : null,
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

module.exports = ArchiveSearches;