/*jshint expr: true*/
var TaggedAPI = require(LIB_DIR);
var HttpMock = require('./mocks/http.js');

describe('Tagged API', function() {

    beforeEach(function() {
        this.http = new HttpMock();
        this.api = new TaggedAPI('/api.php', this.http);
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        this.clock.restore();
    });

    it('is a function', function() {
        TaggedAPI.should.be.a('function');
    });

    it('endpoint is defined', function() {
        this.api.should.have.property('endpoint');
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

    it('api.execute should return a promise', function() {
        var result = this.api.execute("foo");
        result.then.should.be.a('function');
        //TODO: Find out a better way to check later
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
            url: '/api.php'
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
            url: '/api.php'
        }).should.be.true;
        this.http.post.calledOnce.should.be.true;
    });
});
