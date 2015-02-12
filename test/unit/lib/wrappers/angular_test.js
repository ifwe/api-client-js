/*jshint expr: true*/
var wrapper = require(LIB_DIR + '/wrappers/angular');

describe('Angular Wrapper', function() {
    beforeEach(function() {
        this.module = {
            factory: sinon.spy()
        };

        this.angular = {
            module: sinon.spy(function() {
                return this.module;
            }.bind(this))
        };

        this.TaggedApi = sinon.spy();
        this.TaggedApi.AngularAdapter = sinon.spy();

        wrapper(this.angular, this.TaggedApi);
    });

    it('registers module "tagged.service.api"', function() {
        this.angular.module.calledOnce.should.be.true;
        this.angular.module.lastCall.args[0].should.equal('tagged.service.api');
    });

    it('registers factory "taggedApi"', function() {
        this.module.factory.calledOnce.should.be.true;
        this.module.factory.lastCall.args[0].should.equal('taggedApi');
    });

    it('returns a new TaggedApi instance', function() {
        var $http = {};
        var $q = {};
        var api = this.module.factory.lastCall.args[1]($http, $q);
        api.should.be.instanceOf(this.TaggedApi);
    });

    it('injects an instance of the Angular adapter', function() {
        var $http = {};
        var $q = {};
        var api = this.module.factory.lastCall.args[1]($http, $q);
        this.TaggedApi.lastCall.args[2].should.be.instanceOf(this.TaggedApi.AngularAdapter);
    });

});
