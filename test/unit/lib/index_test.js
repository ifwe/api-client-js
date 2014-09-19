/*jshint expr: true*/
var TaggedAPI = require(LIB_DIR);
var HttpMock = require('./mocks/http.js');

describe('Tagged API', function() {
    beforeEach(function() {
        this.http = new HttpMock();
        this.endpoint = '/api.php';
        this.options = {
            query: {
                foo: '123',
                bar: 'abc'
            },
            params: {
                defaultParam1: 'defaultValue1',
                defaultParam2: 'defaultValue2'
            },
            cookies: 'test_cookie=123'
        };
        this.api = new TaggedAPI(this.endpoint, this.options, this.http);
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        this.clock.restore();
    });

    it('is a function', function() {
        TaggedAPI.should.be.a('function');
    });

    describe('execute()', function() {
        it('is a function', function() {
            this.api.execute.should.be.a('function');
        });

        it('throws exception if no method parameter is passed in', function() {
            var _this = this;

            expect(function(){
               _this.api.execute();
            }).to.throw();
        });

        it('does not throw exception if method parameter is provided', function() {
            var _this = this;

            expect(function(){
               _this.api.execute("foo.bar");
            }).to.not.throw();
        });

        it('makes http call to api server on next tick', function() {
            this.api.execute("method", {
                foo: "foo",
                bar: "bar"
            });
            this.http.post.called.should.be.false;
            this.clock.tick(1);
            this.http.post.called.should.be.true;
        });

        it('makes post with transformed post body and correct endpoint', function() {
            this.api.execute("im.send", {
                param1: "foo",
                param2: "bar"
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.contain('param1=foo');
            this.http.post.lastCall.args[0].body.should.contain('param2=bar');
        });

        it('does not submit prototypal properties', function(){
            var fakeObj = function() {
                this.foo = "bar";
                this.baz = "bot";
            };

            fakeObj.prototype.bob = "something";

            this.api.execute("my.api", new fakeObj());
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.not.contain('bob=something');
        });

        it('adds parameters to query string', function() {
            this.api.execute("im.send", {
                param1: "foo",
                param2: "bar"
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].url.should.contain("?foo=123&bar=abc");
        });

        it('encodes param keys', function() {
            this.api.execute("im.send", {
                "pb&j": "foo"
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.contain('pb%26j=foo');
        });

        it('encodes param values', function() {
            this.api.execute("im.send", {
                param1: "foo&bar"
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.contain('param1=foo%26bar');
        });

        it('makes one post call for two api requests', function() {
            var expectedBody = "\nmethod=im.send&param1=foo&param2=bar\n" +
                "method=im.doStuff&param3=bar&param4=baz\n";
            this.api.execute("im.send", {
                param1: "foo",
                param2: "bar"
            });
            this.api.execute("im.doStuff", {
                param3: "bar",
                param4: "baz"
            });
            this.clock.tick(1);
            this.http.post.calledOnce.should.be.true;
        });

        // WTA-537
        it('does not bleed parameters', function() {
            this.api.execute("im.send", {
                param1: "foo",
                param2: "bar"
            });
            this.api.execute("im.doStuff", {
                param3: "bar",
                param4: "baz"
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.not.match(/method=im.send.*param3=bar/);
            this.http.post.lastCall.args[0].body.should.not.match(/method=im.doStuff.*param1=foo/g);
        });

        it('makes new post call after clock tick', function() {
            var expectedBody = "\nmethod=im.send&param1=foo&param2=bar\n";
            this.api.execute("im.send", {
                param1: "foo",
                param2: "bar"
            });
            this.clock.tick(1);
            this.http.post.calledOnce.should.be.true;

            // Second call uses a new, empty queue
            this.api.execute("im.doStuff", {
                param1: "bar",
                param2: "baz"
            });
            this.clock.tick(1);
            this.http.post.calledTwice.should.be.true;
        });

        it('passes cookies to http adapter post()', function() {
            this.api.execute('anything');
            this.clock.tick(1);
            this.http.post.lastCall.args[0].should.have.property('cookies', this.options.cookies);
        });

        it('resolves promise with parsed response data', function() {
            var expectedResult = { foo: 'bar' };
            var promise = this.api.execute('anything');
            this.clock.tick(1);
            this.http.resolve({
                // ugly response body :(
                body: '["{\\"foo\\":\\"bar\\"}"]'
            });
            this.http.verifyNoPendingRequests();
            return promise.should.eventually.deep.equal(expectedResult);
        });

        it('rejects promise with if response data cannot be parsed', function() {
            var promise = this.api.execute('anything');
            this.clock.tick(1);
            this.http.resolve({
                // ugly response body :(
                body: 'NOT JSON'
            });
            this.http.verifyNoPendingRequests();
            return promise.should.be.rejected;
        });

        it('rejects promise if response contains stat !== "ok"', function() {
            var expectedResult = { foo: 'bar' };
            var promise = this.api.execute('anything');
            this.clock.tick(1);
            this.http.resolve({
                body: '["{\\"stat\\":\\"fail\\"}"]'
            });
            this.http.verifyNoPendingRequests();
            return promise.should.be.rejected;
        });
    });

    describe('middleware()', function() {
        beforeEach(function() {
            this.req = {};
            this.res = {};
            this.next = sinon.spy();
            this.middleware = TaggedAPI.middleware();
        });

        it('returns a function', function() {
            this.middleware.should.be.a('function');
        });

        it('assigns api instance to request', function() {
            this.middleware(this.req, this.res, this.next);
            this.req.should.have.property('api');
            this.req.api.should.be.instanceOf(TaggedAPI);
        });

        it('passes request cookies to api instance', function() {
            this.req.headers = {
                cookie: 'test_cookie=1'
            };
            this.middleware(this.req, this.res, this.next);
            this.req.api._options.cookies.should.equal(this.req.headers.cookie);
        });

        it('calls next()', function() {
            this.middleware(this.req, this.res, this.next);
            this.next.calledOnce.should.be.true;
        });
    });

    describe('track param', function(){
        it('is autogenerated and passed with each request', function() {

            this.api.execute("im.send", {
                param1: "foo",
                param2: "bar"
            });
            this.clock.tick(1);

            var body = this.http.post.lastCall.args[0].body;

            // check to make sure property is in body
            body.should.contain('track=');
        });
    });
});
