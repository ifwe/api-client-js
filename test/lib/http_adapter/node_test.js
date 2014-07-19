/*jshint expr: true*/
var Http = require(LIB_DIR + '/http_adapter/node');
var request = require('request');

describe('Node HTTP Adapter', function() {
    beforeEach(function() {
        this.request = request;
        this.request.respondWith = function() {
            throw new Error("No request has been made that we can respond to");
        };
        sinon.stub(this.request, 'post', function(options, callback) {
            // Replace `this.request.respondWith` with a callback, allowing us to invoke
            // the callback ourselves within the tests.
            this.request.respondWith = callback;
        }.bind(this));
    });

    afterEach(function() {
        this.request.post.restore();
    });

    it('exists', function() {
        Http.should.be.ok;
    });

    describe('post()', function() {
        beforeEach(function() {
            this.http = new Http(this.request);
        });

        it('posts body to specified url', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            this.http.post({
                url: url,
                body: body
            });
            this.request.post.calledOnce.should.be.true;
            this.request.post.lastCall.args[0].should.have.property('url', url);
        });

        it('posts cookies to specified url', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var cookies = 'testcookies=1';
            this.http.post({
                url: url,
                body: body,
                cookies: cookies
            });
            this.request.post.calledOnce.should.be.true;
            this.request.post.lastCall.args[0].should.have.property('headers');
            this.request.post.lastCall.args[0].headers.should.have.property('Cookie', cookies);
        });

        it('resolves with response', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var expectedBody = 'expected body';
            var result = this.http.post({
                url: url,
                body: body
            });

            this.request.respondWith(null, {
                body: expectedBody
            });

            return result.should.become({
                body: expectedBody
            });
        });

        it('rejects with error', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var error = 'test error';
            var result = this.http.post({
                url: url,
                body: body
            });

            this.request.respondWith(error);

            return result.should.be.rejectedWith(error);
        });
    });
});
