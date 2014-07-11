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
});
