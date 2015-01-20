// This file is generally run in a browser, so wrap it in an IIFE
(function() {
    'use strict';

    var wrapper = function(angular, TaggedApi) {
        // ## Module: tagged.service.api
        // Registers the module `tagged.service.api` with Angular,
        // allowing Angular apps to declare this module as a dependency.
        // This module has no depdencies of its own.
        var module = angular.module('tagged.service.api', ['ngCookies']);

        // Register `taggedApi` as a factory,
        // which allows Angular us to return the service ourselves.
        // What we return will end up as a singleton
        // and the same instance will be passed around through the Angular app.
        module.factory('taggedApi', taggedApiFactory);

        taggedApiFactory.$inject = ['$http', '$cookies', '$q'];
        function taggedApiFactory($http, $cookies, $q) {
            var angularAdapter = new TaggedApi.AngularAdapter($http, $cookies);

            var api = new TaggedApi('/api/', {
                query: {
                    application_id: 'user',
                    format: 'json'
                }
            }, angularAdapter);

            // Wrap `execute()` in an Angular promise
            api.execute = function(method, params) {
                return $q.when(TaggedApi.prototype.execute.call(this, method, params));
            };

            return api;
        }
    };

    if (typeof exports !== 'undefined') {
        // We're in a nodejs environment, export this module
        module.exports = wrapper;
    } else {
        // We're in a browser environment, expose this module globally
        TaggedApi.angularWrapper = wrapper;
    }
})();
