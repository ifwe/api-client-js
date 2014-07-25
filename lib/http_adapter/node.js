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
    });
};

module.exports = Http;
