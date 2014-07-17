/*jshint expr: true*/
var TaggedAPI = require(LIB_DIR);
var HttpMock = require('./mocks/http.js');

describe('Tagged API', function() {
    beforeEach(function() {
        this.http = new HttpMock();
        this.endpoint = '/api.php';
        this.api = new TaggedAPI(this.endpoint, this.http);
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        this.clock.restore();
    });

    it('is a function', function() {
        TaggedAPI.should.be.a('function');
    });

    it('api should have a execute method', function() {
        this.api.execute.should.be.a('function');
    });

    it('api.execute should throw exception with a method string', function() {
        var _this = this;

        expect(function(){
           _this.api.execute();
        }).to.throw();
    });

    it('api.execute should not throw exception with a method string', function() {
        var _this = this;

        expect(function(){
           _this.api.execute("foo.bar");
        }).to.not.throw();
    });

    it.skip('api.execute should return a promise', function() {
        var expectedResult = { foo: 'bar' };

        // We must `return` the result of this assertion, which itself is a promise.
        // This hints to Mocha to wait until the promise resolves before marking this
        // test as a pass or fail.
        return this.api.execute("foo").should.eventually.deep.equal(expectedResult);
    });

    it('api.execute makes http call to api server on next tick', function() {
        this.api.execute("method", {
            foo: "foo",
            bar: "bar"
        });
        this.http.post.called.should.be.false;
        this.clock.tick(1);
        this.http.post.called.should.be.true;
    });

    it('api.execute makes post with transformed post body and correct endpoint', function() {
        var expectedBody = "\nmethod=im.send&param1=foo&param2=bar\n";
        this.api.execute("im.send", {
            param1: "foo",
            param2: "bar"
        });
        this.clock.tick(1);
        this.http.post.calledWith({
            body: expectedBody,
            url: this.endpoint
        }).should.be.true;
    });

    it('api.execute makes post with encoded keys', function() {
        var expectedBody = "\nmethod=im.send&pb%26j=foo\n";
        this.api.execute("im.send", {
            "pb&j": "foo"
        });
        this.clock.tick(1);
        this.http.post.calledWith({
            body: expectedBody,
            url: this.endpoint
        }).should.be.true;
    });

    it('api.execute makes post with encoded parameter values', function() {
        var expectedBody = "\nmethod=im.send&param1=foo%26bar\n";
        this.api.execute("im.send", {
            param1: "foo&bar"
        });
        this.clock.tick(1);
        this.http.post.calledWith({
            body: expectedBody,
            url: this.endpoint
        }).should.be.true;
    });


    it('api.execute makes one post call for two api requests', function() {
        var expectedBody = "\nmethod=im.send&param1=foo&param2=bar\n" +
            "method=im.doStuff&param1=bar&param2=baz\n";
        this.api.execute("im.send", {
            param1: "foo",
            param2: "bar"
        });
        this.api.execute("im.doStuff", {
            param1: "bar",
            param2: "baz"
        });
        this.clock.tick(1);
        this.http.post.calledWith({
            body: expectedBody,
            url: this.endpoint
        }).should.be.true;
        this.http.post.calledOnce.should.be.true;
    });

    it('api.execute makes new post call after clock tick', function() {
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
        this.http.post.calledWith({
            body: expectedBody,
            url: this.endpoint
        }).should.be.true;
    });
});
