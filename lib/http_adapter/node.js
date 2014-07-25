var Promise = require('bluebird');

var Http = function(request) {
    this._request = request || require('request');
    Promise.promisifyAll(this._request);
};

Http.prototype.post = function(req) {
    return this._request.postAsync({
        url: req.url,
        body: req.body,
        timeout: 10000,
        headers: {
            Cookie: req.cookies || ''
        }
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
