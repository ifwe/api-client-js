var Q = require('q');

var HttpMock = function() {
    this.deferreds = [];

    this.post = sinon.spy(function() {
        var deferred = Q.defer();
        this.deferreds.push(deferred);
        return deferred.promise;
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
};

module.exports = HttpMock;
