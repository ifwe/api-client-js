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
            this.url = 'http://example.com/foo';
            this.body = 'post body';
        });

        it('posts body to specified url', function() {
            this.http.post({
                url: this.url,
                body: this.body
            });
            this.request.post.calledOnce.should.be.true;
            this.request.post.lastCall.args[0].should.have.property('url', this.url);
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

        it('posts client id and client secret to header if provided', function() {
            var cookies = 'testcookies=1';
            var clientId = 'testClientId';
            var clientSecret = 'testSecret';
            this.http.post({
                url: this.url,
                body: this.body,
                cookies: cookies,
                clientId: clientId,
                secret: clientSecret
            });
            this.request.post.calledOnce.should.be.true;
            this.request.post.lastCall.args[0].should.have.property('headers');
            this.request.post.lastCall.args[0].headers.should.have.property('x-tagged-client-id', clientId);
            this.request.post.lastCall.args[0].headers.should.have.property('x-tagged-client-secret', clientSecret);
        });

        it('sets content-type header', function() {
            var expectedContentType = 'application/x-www-form-urlencoded; charset=UTF-8';
            var url = 'http://example.com/foo';
            var body = 'post body';
            this.http.post({
                url: url,
                body: body
            });
            this.request.post.calledOnce.should.be.true;
            this.request.post.lastCall.args[0].should.have.property('headers');
            this.request.post.lastCall.args[0].headers.should.have.property('Content-Type', expectedContentType);
        });

        it('calls with extra headers if headrs were sent', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            this.http.post({
                url: url,
                body: body,
                headers: {
                    X_Custom_Test: 'text'
                }
            });
            this.request.post.lastCall.args[0].headers.should.have.property('X_Custom_Test', 'text');
        });

        it('resolves with response', function() {
            var expectedBody = 'expected body';
            var result = this.http.post({
                url: this.url,
                body: this.body
            });

            this.request.respondWith(null, {
                body: expectedBody
            }, expectedBody);

            return result.should.become({
                body: expectedBody
            });
        });

        it('rejects with error', function() {
            var error = 'test error';
            var result = this.http.post({
                url: this.url,
                body: this.body
            });

            this.request.respondWith(error);

            return result.should.be.rejectedWith(error);
        });

        describe('timeout', function() {
            it('defaults to 10s', function() {
                this.http.post({
                    url: 'url',
                    body: 'body'
                });
                this.request.post.lastCall.args[0].should.contain({
                    timeout: 10000
                });
            });

            it('can be overwritten', function() {
                this.http.setTimeout(30000);
                this.http.post({
                    url: 'url',
                    body: 'body'
                });
                this.request.post.lastCall.args[0].should.contain({
                    timeout: 30000
                });
            });
        });
    });
});
