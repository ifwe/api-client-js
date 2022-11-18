var Promise = require('bluebird');
var KeepAliveAgent = require('agentkeepalive');

// @see https://github.com/node-modules/agentkeepalive
var agent = new KeepAliveAgent({
    maxSockets: Infinity,       // default is Infinity
    maxFreeSockets: 256,        // default is 256
    timeout: 60000,             // default is keepAliveTimeout * 2
    keepAliveTimeout: 30000     // free socket keepalive for 30 seconds
});

var Http = function(request) {
    this._request = request || require('request');
    Promise.promisifyAll(this._request);
    this._timeout = 10000;
};

Http.prototype.setTimeout = function setTimeout(timeout) {
    this._timeout = parseInt(timeout, 10) || 10000;
};

Http.prototype.post = function post(req) {
    var headers = {
        Cookie: req.cookies || {},
        'x-tagged-client-id': req.clientId,
        'x-tagged-client-secret': req.secret,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };

    if (req.headers) {
        var reqHeaders = req.headers;

        Object.keys(reqHeaders).forEach(function (i) {
            if (!headers.hasOwnProperty(i)) {
                headers[i] = reqHeaders[i];
            }
        });
    }

    return this._request.postAsync({
        url: req.url,
        body: req.body,
        timeout: this._timeout,
        headers: headers,
        agent: agent
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
// Newer versions of the request library do not return an array,
// so we need to check that here.
var extractRequest = function(data) {
    return Array.isArray(data) ? data[0] : data;
};

module.exports = Http;
