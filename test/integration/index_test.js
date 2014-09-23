/* jshint expr:true */
var TaggedAPI = require(LIB_DIR);
var NodeHttpAdapter = require(LIB_DIR + '/http_adapter/node');

describe('Integration', function() {
    beforeEach(function() {
        this.http = new NodeHttpAdapter();
        this.api = new TaggedAPI('http://www.tag-stage.com/api/', {
            query: {
                application_id: 'user',
                format: 'JSON'
            },
            params: {
                api_signature: '',
                track: 'ya9GupbsRi'
            },
            cookies: 'L=zRVM1cpH3h9U.1l1RIa.1P74p2u'
        }, this.http);
    });

    describe('tagged.alerts.get', function() {
        it('resolves promise with object containing stat: ok', function() {
            return this.api.execute('tagged.alerts.get', {
                count: 7
            }).should.eventually.have.property('stat', 'ok');
        });

        it('resolves promise with object containing result array', function() {
            return this.api.execute('tagged.alerts.get', {
                count: 7
            }).then(function(result) {
                result.should.have.property('result');
                result.result.should.be.an('Array');
                // Note: Asserting the specific values of the the result array would be
                // too flaky because the values may change over time.
            });
        });
    });

    describe('tagged.nonexistent.endpoint', function() {
        it('rejects promise', function() {
            return this.api.execute('tagged.nonexistent.endpoint').should.be.rejected;
        });
    });

    describe('nested data endpoint: tagged.log.photoUpload', function() {
        it('resolves promise with object containing stat: ok', function() {
            return this.api.execute('tagged.log.photoUpload', {
                name: 'photo_upload_lightbox',
                data: ['meetme_meetme_yes_pinchpoint', 'view']
            }).should.eventually.have.property('stat', 'ok');
        });
    });
});
