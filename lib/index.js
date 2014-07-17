var Q = require('q');

var TaggedAPI = function(endpoint, http) {
    this._endpoint = endpoint;
    this._http = http;
    this._queue = [];
    this._batchTimeout = null;
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

    if (null === this._batchTimeout) {
        this._batchTimeout = setTimeout(function() {
            this._execute();
        }.bind(this), 1);
    }

    return deferred.promise;
};

TaggedAPI.prototype._execute = function() {
    var body = stringifyQueue(this._queue);
    this._http.post({body: body, url: this._endpoint});
    this.clearQueue();
};

// Clears the queue of API calls and the batch timeout
TaggedAPI.prototype.clearQueue = function() {
    if (null !== this._batchTimeout) {
        clearTimeout(this._batchTimeout);
        this._batchTimeout = null;
    }
    this._queue = [];
};

// Transforms the post data into the format required by the API
var stringifyQueue = function(queue) {
    // Each API call will be transformed into a string of
    // key/value pairs and placed into this array.
    var calls = [];

    for (var i in queue) {
        var call = stringifyCall(queue[i]);
        calls.push(call);
    }

    return "\n" + calls.join("\n") + "\n";
};

var stringifyCall = function(call) {
    // Each key/value pair of the API call will be placed
    // into this params array as a `key=value` string.
    var params = ["method=" + encodeURIComponent(call.method)];

    // Add each custom param to the params array as a
    // `key=value` string.
    for (var key in call.params) {
        // Passing `null` as a value is not supported by
        // the API, so omit those values.
        if (null !== call.params[key]) {
            params.push(
                // Keys and values must be encoded to
                // prevent accidental breakage of string
                // splits by `=` and `&`.
                encodeURIComponent(key) +
                "=" +
                encodeURIComponent(call.params[key])
            );
        }
    }

    // All params are joined by `&`, resulting in a single
    // one-line string to represent the API call.
    return params.join('&');
};

module.exports = TaggedAPI;
