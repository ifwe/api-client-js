/*jshint expr: true*/
var TaggedAPI = require(LIB_DIR);

describe('Tagged API', function() {
    beforeEach(function() {
        this.api = new TaggedAPI('/api.php');
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
});
