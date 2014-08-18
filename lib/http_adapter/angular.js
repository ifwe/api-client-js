// This file is generally run in a browser, so wrap it in an IIFE
(function() {
    'use strict';

    var context = typeof exports !== 'undefined' ? exports : window;
    var Promise = context.Promise || require('bluebird');

    AngularAdapter.$inject = ['$http'];
    function AngularAdapter($http) {
        this._$http = $http;
    }

    AngularAdapter.prototype.post = function(req) {
        return this._$http.post(req.url, req.body, {
            timeout: 10000,
            transformResponse: transformResponse
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
