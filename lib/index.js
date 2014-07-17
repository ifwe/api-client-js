var Q = require('q');

var TaggedAPI = function(endpoint, http) {
    this.endpoint = endpoint;
    this._http = http;
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

    if (!this._batchTimeout) {
        this._batchTimeout = setTimeout(function() {
            this._execute();
        }.bind(this), 1);
    }

    return deferred.promise;
};

TaggedAPI.prototype._execute = function() {
    var body = transform(this._queue);
    this._http.post({body: body, url: this.endpoint});
};

// Transforms the post data into the format required by the API
var transform = function(queue) {
    var calls = [];
    for (var i in queue) {
        var params = ["method=" + queue[i].method];
        for (var p in queue[i].params) {
            if (null !== queue[i].params[p]) {
                params.push(encodeURIComponent(p) +
                    "=" + encodeURIComponent(queue[i].params[p]));
            }
        }

        calls.push(params.join("&"));
    }
    return "\n" + calls.join("\n") + "\n";
};

module.exports = TaggedAPI;