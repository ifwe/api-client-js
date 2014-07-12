/*jshint expr: true*/
var TaggedAPI = require(LIB_DIR);
var HttpMock = require('./mocks/http.js');

describe('Tagged API', function() {

    beforeEach(function() {
    	this.http = new HttpMock();
        this.api = new TaggedAPI('/api.php', this.http);
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

    it('api.execute makes call to api server', function() {
    	this.api.execute("method", {foo: "foo", bar: "bar"});
    	this.http.post.called.should.be.true;
    });
});
