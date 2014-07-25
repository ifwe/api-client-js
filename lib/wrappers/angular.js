;(function() {
    var wrapper = function(angular, TaggedApi) {
        // ## Module: tagged.service.api
        // Registers the module `tagged.service.api` with Angular,
        // allowing Angular apps to declare this module as a dependency.
        // This module has no depdencies of its own.
        var module = angular.module('tagged.service.api', []);

        // Register `taggedApi` as a factory,
        // which allows Angular us to return the service ourselves.
        // What we return will end up as a singleton
        // and the same instance will be passed around through the Angular app.
        module.factory('taggedApi', taggedApiFactory);

        taggedApiFactory.$inject = ['$http'];
        function taggedApiFactory($http) {
            var angularAdapter = new TaggedApi.AngularAdapter($http);
            return new TaggedApi('/api', {}, angularAdapter);
        }
    };

    if (typeof exports !== 'undefined') {
        // We're in a nodejs environment, export this module
        module.exports = wrapper;
    } else {
        // We're in a browser environment, expose this module globally
        var TaggedApi = context.TaggedApi || {};
        TaggedApi.angularWrapper = wrapper;
    }
})();
