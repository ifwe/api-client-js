var HttpMock = function() {

};

HttpMock.prototype.post = sinon.spy();

module.exports = HttpMock;