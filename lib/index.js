var Q = require('q');

var TaggedAPI = function(endpoint) {
	this.endpoint = endpoint;
	this._queue = [];
};

TaggedAPI.prototype.execute = function(method, params) {
    if (!method || typeof method !== "string") {
        throw "Api method is required";
    }

    var deferred = Q.defer();
 	this._queue.push({
 		method: method,
 		params: params || {},
 		deferred: deferred
 	});

    return deferred.promise;
};

module.exports = TaggedAPI;