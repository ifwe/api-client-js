var Promise = require('bluebird');

var HttpMock = function() {
    var timeout = 10000;

    this.deferreds = [];

    this.post = sinon.spy(function() {
        var promise = new Promise(function(resolve, reject) {
            this.deferreds.push({resolve: resolve, reject: reject});
        }.bind(this));
        return promise;
    });

    this.resolveAll = function(values) {
        for (var i in values) {
            this.resolve(values[i]);
        }
    };

    this.resolve = function(value) {
        if (!this.deferreds.length) {
            throw new Error("No more deferreds to resolve " + JSON.stringify(value));
        }

        var deferred = this.deferreds.shift();
        deferred.resolve(value);
    };

    this.verifyNoPendingRequests = function() {
        if (this.deferreds.length) {
            throw new Error("" + this.deferreds.length + " unresolved requests remaining.");
        }
    };

    this.setTimeout = function(_timeout) {
        timeout = _timeout;
    };
};

module.exports = HttpMock;
