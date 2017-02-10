var VanillaAdapter = require(LIB_DIR + '/http_adapter/vanilla').VanillaAdapter;
var Promise = require('bluebird');

function mockXMLHttpRequestFactory() {
    var expectedRequests = [];
    var allRequests = [];

    var MockXMLHttpRequest = function() {
        this._headers = {};
    };

    MockXMLHttpRequest.prototype.open = function(method, url, async) {
        this._method = method;
        this._url = url;
        this._async = async;
    };

    MockXMLHttpRequest.prototype.onreadystatechange = undefined;

    MockXMLHttpRequest.prototype.send = function(body) {
        // Look through stubbed requests and immediately respond
        for (var i in expectedRequests) {
            var request = expectedRequests[i].request;

            if (request.method !== this._method) {
                continue;
            }

            if (request.url !== this._url) {
                continue;
            }

            if (request.body && request.body !== body) {
                continue;
            }

            // Found matching request
            var response = expectedRequests[i].response;
            expectedRequests.splice(i, 1);
            this.readyState = 4;
            this.responseText = response.body;
            allRequests.push({
                xhr: this,
                request: request,
                response: response
            });
            this.onreadystatechange();
            return;
        }

        // Not found
        throw new Error('Unexpected request: ' + this._method + ' ' + this._url);
    };

    MockXMLHttpRequest.prototype.setRequestHeader = function(key, value) {
        this._headers[key] = value;
    };

    MockXMLHttpRequest.prototype.getRequestHeaders = function() {
        return this._headers;
    };

    MockXMLHttpRequest.expectRequest = function(request, response) {
        if (typeof request === 'string') {
            request = {
                method: 'POST',
                url: request
            };
        }

        if (typeof response === 'string') {
            response = {
                body: response
            };
        }

        expectedRequests.push({
            request: request,
            response: response
        });

        return this;
    };

    MockXMLHttpRequest.lastRequest = function() {
        return allRequests[allRequests.length - 1];
    };

    return MockXMLHttpRequest;
}

describe('VanillaJS Adapter', function() {
    beforeEach(function() {
        this.MockXMLHttpRequest = mockXMLHttpRequestFactory();
        this.adapter = new VanillaAdapter(this.MockXMLHttpRequest, Promise);
        this.clock = sinon.useFakeTimers(10000);
    });

    afterEach(function() {
        this.clock.restore();
    });

    it('is a constructor', function() {
        VanillaAdapter.should.be.a('function');
    });

    describe('headers', function() {
        it('should set X-Requested-With, Content-Type in headers', function() {
            this.MockXMLHttpRequest.expectRequest('http://abc.def', '{}');
            return this.adapter.post({
                url: 'http://abc.def',
                body: 'something'
            }).then(function() {
                this.MockXMLHttpRequest.lastRequest().xhr.getRequestHeaders().should.have.property('X-Requested-With', 'XMLHttpRequest');
                this.MockXMLHttpRequest.lastRequest().xhr.getRequestHeaders().should.have.property('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }.bind(this));
        });
        it('sets singular header', function() {
            this.adapter.setHeader('x-tagged-client-id', 'test-client-id');
            this.MockXMLHttpRequest.expectRequest('http://abc.def', '{}');
            return this.adapter.post({
                url: 'http://abc.def',
                body: 'something'
            }).then(function() {
                this.MockXMLHttpRequest.lastRequest().xhr.getRequestHeaders().should.have.property('x-tagged-client-id', 'test-client-id');
            }.bind(this));
        });
        it('sets multiple headers', function() {
            this.adapter.setHeaders({
                'x-tagged-client-id': 'test-client-id',
                'x-extra-header': 'extra-header'
            });
            this.MockXMLHttpRequest.expectRequest('http://abc.def', '{}');
            return this.adapter.post({
                url: 'http://abc.def',
                body: 'something'
            }).then(function() {
                this.MockXMLHttpRequest.lastRequest().xhr.getRequestHeaders().should.have.property('x-tagged-client-id', 'test-client-id');
                this.MockXMLHttpRequest.lastRequest().xhr.getRequestHeaders().should.have.property('x-extra-header', 'extra-header');
            }.bind(this));
        })
    });

    describe('setTimeout()', function() {
        it('is a function', function() {
            this.adapter.setTimeout.should.be.a('function');
        });

        it('defaults to 10s', function() {
            this.MockXMLHttpRequest.expectRequest('http://abc.def', '{}');
            return this.adapter.post({
                url: 'http://abc.def',
                body: 'something'
            }).then(function() {
                this.MockXMLHttpRequest.lastRequest().xhr.timeout.should.equal(10000);
            }.bind(this));
        });

        it('should be able to override timeout', function() {
            this.adapter.setTimeout(20000);
            this.MockXMLHttpRequest.expectRequest('http://abc.def', '{}');
            return this.adapter.post({
                url: 'http://abc.def',
                body: 'something'
            }).then(function() {
                this.MockXMLHttpRequest.lastRequest().xhr.timeout.should.equal(20000);
            }.bind(this));
        })
    });

    describe('post()', function() {
        it('is a function', function() {
            this.adapter.post.should.be.a('function');
        });

        it('formats resolved response', function() {
            this.MockXMLHttpRequest.expectRequest('http://abc.def', '{ "foo": "bar" }');
            return this.adapter.post({
                clientId: 12345,
                url: 'http://abc.def',
                body: 'something'
            }).then(function(response) {
                response.should.have.property('foo', 'bar');
            }.bind(this));
        });
    });
});
