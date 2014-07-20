var Q = require('q');
var _ = require('lodash');

var TaggedAPI = function(endpoint, options, http) {
    this._endpoint = endpoint;
    this._http = http;
    this._queue = [];
    this._batchTimeout = null;
    this.options = _.merge({
        query: {},
        params: {},
        cookies: ''
    }, options || {});
};

TaggedAPI.prototype.execute = function(method, params) {
    if (!method || typeof method !== "string") {
        throw "Api method is required";
    }

    var deferred = Q.defer();

    this._queue.push({
        method: method,
        params: _.merge(this.options.params, params || {}),
        deferred: deferred
    });

    if (null === this._batchTimeout) {
        this._batchTimeout = setTimeout(this._execute.bind(this), 1);
    }

    return deferred.promise;
};

TaggedAPI.prototype._execute = function() {
    var body = stringifyQueue(this._queue);
    var queryArray = [],
        queryString;

    for(var key in this.options.query) {
        queryArray.push(key + "=" + this.options.query[key]);
    }

    queryString = queryArray.join('&');

    this._http.post({
        body: body,
        url: this._endpoint + "?" + queryString,
        cookies: this.options.cookies
    })
    .then(parseResponseBody)
    .then(resolveQueue.bind(this, this._queue))
    .catch(rejectQueue.bind(this, this._queue))
    .done();

    this.resetQueue();
};

// Parses the body of a JSON response and returns an
// array of objects.
var parseResponseBody = function(response) {
    var results = [];
    var responses = JSON.parse(response.body);

    // exceptions will be bubbled up
    for (var i in responses) {
        results.push(JSON.parse(responses[i]));
    }

    return results;
};


// Resolves all queued promises with the associated
// result from the API response.
var resolveQueue = function(queue, results) {
    for (var i in queue) {
        queue[i].deferred.resolve(results[i]);
    }

    return results;
};

// Rejects all the queued promises with the provided
// error.
var rejectQueue = function(queue, error) {
    for (var i in queue) {
        queue[i].deferred.reject(error);
    }

    return error;
};

// Clears the queue of API calls and the batch timeout.
TaggedAPI.prototype.resetQueue = function() {
    if (null !== this._batchTimeout) {
        clearTimeout(this._batchTimeout);
        this._batchTimeout = null;
    }
    this._queue = [];
};

TaggedAPI.middleware = function(url, options) {
    var NodeAdapter = require('./http_adapter/node');
    var http = new NodeAdapter();

    return function(req, res, next) {
        req.api = new TaggedAPI(url, _.merge({
            cookies: req.headers && req.headers.Cookie
        }, options || {}), http);
    };
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

        //TODO: support arrays as values
        if (null !== call.params[key] && call.params.hasOwnProperty(key)) {
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
