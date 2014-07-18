var Q = require('q');

var Http = function(request) {
    this._request = request || require('request');
};

Http.prototype.post = function(req) {
    var deferred = Q.defer();
    console.log(req);
    this._request.post({
        url: req.url,
        body: req.body,
        timeout: 10000
    }, fullfill.bind(deferred));

    return deferred.promise;
};

var fullfill = function(err, response) {
    if (err) {
        this.reject(err);
    } else {
        this.resolve(response);
    }
};

module.exports = Http;
