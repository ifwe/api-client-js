// This file is generally run in a browser, so wrap it in an IIFE
(function() {
    'use strict';

    var context = typeof exports !== 'undefined' ? exports : window;

    AngularAdapter.$inject = ['$http', '$window'];
    function AngularAdapter($http, $window) {
        this._$http = $http;
        this._$window = $window;
        this._timeout = 10000;
    }

    AngularAdapter.prototype.setTimeout = function(timeout) {
        this._timeout = parseInt(timeout, 10) || 10000;
    };

    AngularAdapter.prototype.post = function(req) {
        var headers = {
            'x-tagged-client-id': req.clientId,
            'x-tagged-client-url': this._$window.location.href,
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
        };
        return this._$http.post(req.url, req.body, {
            timeout: this._timeout,
            transformResponse: transformResponse,
            headers: headers
        }).then(formatResponse);
    };

    var transformResponse = function(data) {
        // Do not deserialize the data -- let API client do that.
        // Just return the raw response body.
        return data;
    };

    var formatResponse = function(response) {
        return {
            body: response.data
        };
    };

    if (typeof exports !== 'undefined') {
        // We're in a nodejs environment, export this module (useful for unit testing)
        module.exports = AngularAdapter;
    } else {
        // We're in a browser environment, export this module globally,
        // attached to the TaggedApi module
        var TaggedApi = context.TaggedApi || {};
        TaggedApi.AngularAdapter = AngularAdapter;
    }
})();
