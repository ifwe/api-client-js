var Promise = require('bluebird');

var Http = function(request) {
    this._request = request || require('request');
    Promise.promisifyAll(this._request);
    this._timeout = 10000;
};

Http.prototype.setTimeout = function(timeout) {
    this._timeout = parseInt(timeout, 10) || 10000;
};

Http.prototype.post = function(req) {
    var headers = {
        Cookie: req.cookies || {},
        'x-tagged-client-id': req.clientId,
        'x-tagged-client-secret': req.secret,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };

    if (req.headers) {
        var reqHeaders = req.headers;

        for (var i in reqHeaders) {
            if (reqHeaders.hasOwnProperty(i) && !headers.hasOwnProperty(i)) {
                headers[i] = reqHeaders[i];
            }
        }
    }

    return this._request.postAsync({
        url: req.url,
        body: req.body,
        timeout: this._timeout,
        headers: headers
    }).then(extractRequest);
};

// `Promise.promisifyAll` will resolve callbacks using an `array`
// if the callback is called with more than 2 arguments.
// e.g. `null, 'something', 'something else'`
// would end up resolving the promise with
// `['something', 'something else']`
// Since `this._request.post` calls the callback with 3 arguments
// e.g. `null, response, body`
// then we must extract the response from the data
// to satisfy the expectations of the adapter.
var extractRequest = function(data) {
    return data[0];
};

module.exports = Http;
