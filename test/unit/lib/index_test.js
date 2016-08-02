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
            cookies: 'L=test_autologin_token',
            clientId: 'testClientId',
            headers: {
                X_Custom_Test: 'text'
            }
        };
        this.api = new TaggedAPI(this.endpoint, this.options, this.http);
        this.fakeNow = 100;
        this.clock = sinon.useFakeTimers(this.fakeNow);
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

        it('supports nested data structures containing arrays', function() {
            this.api.execute("im.send", {
                param1: ["foo", "bar"]
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.contain('param1[]=foo');
            this.http.post.lastCall.args[0].body.should.contain('param1[]=bar');
        });

        it('supports nested data structures containing objects', function() {
            this.api.execute("im.send", {
                param1: { foo: 'test_foo', bar: 'test_bar' }
            });
            this.clock.tick(1);
            this.http.post.lastCall.args[0].body.should.contain('param1[foo]=test_foo');
            this.http.post.lastCall.args[0].body.should.contain('param1[bar]=test_bar');
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

        describe('max queue size', function() {
            it('immediately sends off http request if queue exceeds max queue size', function() {
                this.api.setMaxQueueSize(3);
                this.api.execute("one");
                this.api.execute("two");
                this.http.post.calledOnce.should.be.false;
                this.api.execute("three");
                this.http.post.calledOnce.should.be.true;
                this.api.execute("four");
                this.api.execute("five");
                this.http.post.calledTwice.should.be.false;
                this.clock.tick(1);
                this.http.post.calledTwice.should.be.true;
            });

            it('can be retrieved', function() {
                this.api.setMaxQueueSize(3);
                this.api.getMaxQueueSize().should.equal(3);
                this.api.setMaxQueueSize(10);
                this.api.getMaxQueueSize().should.equal(10);
            });
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
            this.http.post.lastCall.args[0].should.have.property('cookies');
            this.http.post.lastCall.args[0].cookies.should.contain(this.options.cookies);
        });

        it('passes custom headers to http adapter post()', function() {
            this.api.execute('anything');
            this.clock.tick(1);
            this.http.post.lastCall.args[0].should.have.property('headers');
            this.http.post.lastCall.args[0].headers.should.have.property('X_Custom_Test', 'text');
        })

        it('passes client id to http adapter post()', function() {
            this.api.execute('anything');
            this.clock.tick(1);
            this.http.post.lastCall.args[0].should.have.property('clientId');
            this.http.post.lastCall.args[0].clientId.should.contain(this.options.clientId);
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
            var promise = this.api.execute('anything');
            this.clock.tick(1);
            this.http.resolve({
                body: '["{\\"stat\\":\\"fail\\"}"]'
            });
            this.http.verifyNoPendingRequests();
            return promise.should.be.rejected;
        });

        it('resolves promise if response bdy is null', function() {
            var expectedResult = {result: null, stat: 'ok'};
            var promise = this.api.execute('anything');
            this.clock.tick(1);
            this.http.resolve({
                body: null
            });
            this.http.verifyNoPendingRequests();
            return promise.should.eventually.deep.equal(expectedResult);
        });

        describe('caching', function() {
            it('does not cache duplicate calls by default', function() {
                this.api.execute('floop');
                this.api.execute('floop');
                this.clock.tick(1);
                this.http.post.lastCall.args[0].body.match(/method=floop/g).should.have.lengthOf(2);
            });

            it('optionally cache duplicate calls', function() {
                this.api.execute('floop', {bloop: 'blip'}, {cache: true});
                this.api.execute('floop', {bloop: 'blip'}, {cache: true});
                this.clock.tick(1);
                this.http.post.lastCall.args[0].body.match(/method=floop/g).should.have.lengthOf(1);
            });

            it('optionally caches for custom amount of time', function() {
                this.api.execute('floop', {}, {cache: 100});
                this.clock.tick(100001);
                this.api.execute('floop', {}, {cache: true});
                this.clock.tick(1);
                this.http.post.calledTwice.should.be.true;
            });

            it('does not duplicate calls if made before cache expiry time', function() {
                this.api.execute('floop', {}, {cache: 100});
                this.clock.tick(90000);
                this.api.execute('floop', {}, {cache: true});
                this.clock.tick(1);
                this.http.post.calledTwice.should.be.false;
            });

            it('does not use cache if params are different', function() {
                this.api.execute('floop', {bloop: 'blip'}, {cache: true});
                this.api.execute('floop', {bloop: 'bleep'}, {cache: true});
                this.clock.tick(1);
                this.http.post.lastCall.args[0].body.match(/method=floop/g).should.have.lengthOf(2);
            });
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

        it('does not pass headers to api instance by default', function() {
            this.req.headers = {
                X_Custom_Test: 'text'
            };
            this.middleware(this.req, this.res, this.next);
            expect(this.req.api._options.headers).to.be.undefined;
        });

        it('passes headers in whitelist to api instance', function() {
            this.middleware = TaggedAPI.middleware('anything', {
                passHeaders: ['foo', 'bar']
            });
            this.req.headers = {
                foo: 'header_foo',
                bar: 'header_bar',
                derp: 'header_derp'
            };
            this.middleware(this.req, this.res, this.next);
            this.req.api._options.should.have.property('headers');
            this.req.api._options.headers.should.have.property('foo', 'header_foo');
            this.req.api._options.headers.should.have.property('bar', 'header_bar');
            this.req.api._options.headers.should.not.have.property('derp');
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

    describe('on', function() {
        var noop = function() {};

        it('is a function', function(){
            this.api.on.should.be.a("function");
        });

        it('calls provided callback function when specified stat occurs', function() {
            var spy = sinon.spy();
            this.api.on('test_stat', spy);
            spy.called.should.be.false;
            var promise = this.api.execute('test.foo').catch(noop);
            this.clock.tick(1);
            this.http.resolve({
                body: '["{\\"stat\\":\\"test_stat\\"}"]'
            });
            this.http.verifyNoPendingRequests();
            return promise.finally(function() {
                spy.called.should.be.true;
                spy.lastCall.args[0].should.contain({ method: 'test.foo' });
                spy.lastCall.args[1].should.contain({ stat: 'test_stat' });
            });
        });

        it('does not call provided callback function when unspecified stat occurs', function() {
            var spy = sinon.spy();
            this.api.on('test_stat', spy);
            var promise = this.api.execute('test.foo').catch(noop);
            this.clock.tick(1);
            this.http.resolve({
                body: '["{\\"stat\\":\\"anything_else\\"}"]'
            });
            this.http.verifyNoPendingRequests();
            return promise.finally(function() {
                spy.called.should.be.false;
            });
        });

        describe('queue timing', function() {
            describe('in node environments', function() {
                beforeEach(function() {
                    this.stubHightResolutionTimestamp = [123, 456];
                    sinon.stub(process, 'hrtime').returns(this.stubHightResolutionTimestamp);
                });

                afterEach(function() {
                    process.hrtime.restore();
                });

                it('includes timeStart as high-resolution timestamp', function(done) {
                    this.api.on('ok', function(request) {
                        request.timeStart.should.deep.equal(this.stubHightResolutionTimestamp);
                        done();
                    }.bind(this));
                    this.api.execute("im.send");
                    this.clock.tick(1);
                    this.http.resolve({
                        // ugly response body :(
                        body: '["{\\"stat\\":\\"ok\\"}"]'
                    });
                });
            });

            describe('in browser environments that support performance.now()', function() {
                beforeEach(function() {
                    this.stubHightResolutionTimestamp = [123, 456];
                    this.hrtime = process.hrtime;
                    process.hrtime = undefined;
                    GLOBAL.window = {
                        performance: {
                            now: sinon.stub().returns(123.456)
                        }
                    };
                });

                afterEach(function() {
                    process.hrtime = this.hrtime;
                    delete GLOBAL.window;
                });

                it('includes timeStart as high-resolution timestamp', function(done) {
                    this.api.on('ok', function(request) {
                        request.timeStart.should.deep.equal(this.stubHightResolutionTimestamp);
                        done();
                    }.bind(this));
                    this.api.execute("im.send");
                    this.clock.tick(1);
                    this.http.resolve({
                        // ugly response body :(
                        body: '["{\\"stat\\":\\"ok\\"}"]'
                    });
                });
            });

            describe('in browser environments that return strange values for performance.now()', function() {
                beforeEach(function() {
                    this.stubHightResolutionTimestamp = [123, 456];
                    this.hrtime = process.hrtime;
                    process.hrtime = undefined;
                    GLOBAL.window = {
                        performance: {
                            now: sinon.stub().returns('not a high-resolution timestamp')
                        }
                    };
                });

                afterEach(function() {
                    process.hrtime = this.hrtime;
                    delete GLOBAL.window;
                });

                it('falls back to low-resolution timeStart in high-resolution format', function(done) {
                    this.api.on('ok', function(request) {
                        request.timeStart.should.deep.equal([this.fakeNow, 0]);
                        done();
                    }.bind(this));
                    this.api.execute("im.send");
                    this.clock.tick(1);
                    this.http.resolve({
                        // ugly response body :(
                        body: '["{\\"stat\\":\\"ok\\"}"]'
                    });
                });
            });

            describe('in browser environments that do not support-high resolution timestamps', function() {
                beforeEach(function() {
                    this.hrtime = process.hrtime;
                    process.hrtime = undefined;
                    GLOBAL.window = {};
                });

                afterEach(function() {
                    process.hrtime = this.hrtime;
                    delete GLOBAL.window;
                });

                it('falls back to low-resolution timeStart in high-resolution format', function(done) {
                    this.api.on('ok', function(request) {
                        request.timeStart.should.deep.equal([this.fakeNow, 0]);
                        done();
                    }.bind(this));
                    this.api.execute("im.send");
                    this.clock.tick(1);
                    this.http.resolve({
                        // ugly response body :(
                        body: '["{\\"stat\\":\\"ok\\"}"]'
                    });
                });
            });
        });
    });

    describe('timeout', function() {
        beforeEach(function() {
            sinon.spy(this.http, 'setTimeout');
        });

        it('defaults to 10s', function() {
            this.api = new TaggedAPI(this.endpoint, this.options, this.http);
            this.http.setTimeout.calledWith(10000).should.be.true;
        });

        it('can be specified', function() {
            this.options.timeout = 30000;
            this.api = new TaggedAPI(this.endpoint, this.options, this.http);
            this.http.setTimeout.calledWith(30000).should.be.true;
        });

        [null, 0, -1000, true, false, 'string', { object: 'object' }, ['array']].forEach(function(value) {
            it('is set to 10s if invalid value ' + value + ' is used', function() {
                this.options.timeout = value;
                this.api = new TaggedAPI(this.endpoint, this.options, this.http);
                this.http.setTimeout.calledWith(10000).should.be.true;
            });
        });
    });
});
