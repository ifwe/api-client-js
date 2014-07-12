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

    // TODO: Replace this with a real implementation
    setTimeout(function() {
        deferred.resolve({ foo: 'bar'});
    });

    return deferred.promise;
};

module.exports = TaggedAPI;
