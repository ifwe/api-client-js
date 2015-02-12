// This file is generally run in a browser, so wrap it in an IIFE
(function() {
    'use strict';

    var context = typeof exports !== 'undefined' ? exports : window;
    var Promise = context.Promise || require('bluebird');
    var SESSION_COOKIE_NAME_REGEX = /(?:^| )S=/;

    AngularAdapter.$inject = ['$http', '$document', '$window'];
    function AngularAdapter($http, $document, $window) {
        this._$http = $http;
        this._$document = $document;
        this._$window = $window;
    }

    AngularAdapter.prototype.post = function(req) {
        var headers = {
            'x-tagged-client-id': req.clientId,
            'x-tagged-client-url': this._$window.location
        };
        return this._$http.post(req.url, req.body, {
            timeout: 10000,
            transformResponse: transformResponse,
            headers: headers
        }).then(formatResponse);
    };

    AngularAdapter.prototype.getSessionToken = function() {
        var cookie = this._$document[0].cookie;

        // Note: Read from the cookie directly to ensure that it isn't outdated.
        if (!cookie.length) {
            return null;
        }

        var found = cookie.match(SESSION_COOKIE_NAME_REGEX);

        if (!found) {
            return null;
        }

        var start = found.index;

        if (-1 == start) {
            return null;
        }

        start += 2;

        // Regex includes leading space, so account for it.
        if (found[0].charAt(0) === ' ') {
            start++;
        }

        var end = cookie.indexOf(";", start);

        if (-1 == end) {
            end = cookie.length;
        }

        return unescape(cookie.substring(start, end));
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
