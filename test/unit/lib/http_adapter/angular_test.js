var AngularAdapter = require(LIB_DIR + '/http_adapter/angular');
var Promise = context.Promise || require('bluebird');

describe('Angular Adapter', function() {
    beforeEach(function() {
        this.$http = {
            post: sinon.spy(function() {
                return new Promise(function(resolve, reject) {
                    this.resolve = resolve;
                    this.reject = reject;
                }.bind(this));
            }.bind(this))
        };
        this.adapter = new AngularAdapter(this.$http);
    });

    it('is a constructor', function() {
        AngularAdapter.should.be.a('function');
    });

    it('is injected with $http', function() {
        AngularAdapter.should.have.property('$inject');
        AngularAdapter.$inject.should.deep.equal(['$http']);
    });

    describe('post()', function() {
        it('is a function', function() {
            this.adapter.post.should.be.a('function');
        });

        it('POSTs request using $http', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            this.adapter.post({
                url: url,
                body: body
            });
            this.$http.post.calledOnce.should.be.true;
            this.$http.post.lastCall.args[0].should.equal(url);
            this.$http.post.lastCall.args[1].should.equal(body);
        });

        it('formats resolved response', function() {
            var url = 'http://example.com/foo';
            var body = 'post body';
            var result = this.adapter.post({
                url: url,
                body: body
            });
            this.resolve({
                data: 'some data'
            });
            result.should.become({ body: 'some data'});
        });
    });
});
