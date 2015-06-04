var AngularAdapter = require(LIB_DIR + '/http_adapter/angular');
var Promise = context.Promise || require('bluebird');

describe('Angular Adapter', function() {
    beforeEach(function() {
        this.$http = {
            post: sinon.spy(function() {
                return new Promise(function(resolve, reject) {
                    this.resolve = resolve;
                    this.reject = reject;
                }.bind(this));
            }.bind(this))
        };
        this.$window = {
            location: {
                href: '/foo'
            }
        };
        this.adapter = new AngularAdapter(this.$http, this.$window);
    });

    it('is a constructor', function() {
        AngularAdapter.should.be.a('function');
    });

    it('is injected with $http', function() {
        AngularAdapter.should.have.property('$inject');
        AngularAdapter.$inject.should.contain('$http');
    });

    it('is injected with $window', function() {
        AngularAdapter.should.have.property('$inject');
        AngularAdapter.$inject.should.contain('$window');
    });

    describe('post()', function() {
        it('is a function', function() {
            this.adapter.post.should.be.a('function');
        });

        it('POSTs request using $http', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            this.adapter.post({
                url: url,
                body: body
            });
            this.$http.post.calledOnce.should.be.true;
            this.$http.post.lastCall.args[0].should.equal(url);
            this.$http.post.lastCall.args[1].should.equal(body);
        });

        it('formats resolved response', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var result = this.adapter.post({
                url: url,
                body: body
            });
            this.resolve({
                data: 'some data'
            });
            result.should.become({ body: 'some data'});
        });

        it('sets client ID and url in headers', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var clientId = 'testclientid';
            var location = '/foo';
            this.adapter.post({
                url: url,
                body: body,
                clientId: clientId
            });
            this.$http.post.calledOnce.should.be.true;
            this.$http.post.lastCall.args[2].should.have.property('headers');
            this.$http.post.lastCall.args[2].headers['x-tagged-client-id'].should.equal(clientId);
            this.$http.post.lastCall.args[2].headers['x-tagged-client-url'].should.equal(location);
        });

        it('sets content-type header', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var expectedContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
            this.adapter.post({
                url: url,
                body: body
            });
            this.$http.post.calledOnce.should.be.true;
            this.$http.post.lastCall.args[2].headers.should.have.property('Content-Type', expectedContentType);
        });
    });
});
