var TaggedAPI = require(LIB_DIR);
var NodeHttpAdapter = require(LIB_DIR + '/http_adapter/node');

describe('Integration', function() {
    // curl 'http://daiquiri.tag-stage.com:3000/api/?application_id=user&format=json&session_token=ll6raatbk9b4c6759gaoovhvk1' -H 'Origin: http://daiquiri.tag-stage.com:3000' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.99 Safari/537.36' -H 'Content-Type: application/json;charset=UTF-8' -H 'Accept: application/json, text/plain, */*' -H 'Referer: http://daiquiri.tag-stage.com:3000/meetme' -H 'Cookie: __qca=P0-1834184605-1404323535160; __gads=ID=be52a477c1cdc307:T=1404408400:S=ALNI_MbBy4sjPFH17EzNdvi9MChd76h_tg; fbm_122308737786854=base_domain=.tag-stage.com; __ar_v4=FDYSWRR2JFCGBJ3GNOR4YH%3A20150016%3A4%7CK742OAO7V5H3RK2RHZOYRM%3A20150016%3A4%7CLTMUNUXRWFHBFA24S4T7KA%3A20150016%3A4; TOOL=bm3d8pj04fjdrsi8ndd2kg9813; PA=gpt838vmpolus8c58286ne34m0; B=b%3D5D977B3DB31F9BA0%26b%3D939113622DC67D86%26TOR%3Da%253A3%253A%257Bs%253A14%253A%2522mweb_messaging%2522%253Bs%253A1%253A%25221%2522%253Bs%253A19%253A%2522registration_reason%2522%253Bs%253A1%253A%25221%2522%253Bs%253A18%253A%2522popfeed_filter_tab%2522%253Bs%253A1%253A%25221%2522%253B%257D%26jaM6Eosniy%3D123598901406%26gmHyOJiMC3_0001235989014069%252455%252412341MTExMDEwMTExMTAwMTExMTExMDEwMTEwMDEwMDEwMA658%252460%2524103%3D10011121506959251053810-9813%26daiquiri%3D1=&b=00188563031C7E60&jaM6Eosniy=123598901406&gmHyOJiMC3_0001235989014069%2455%2412341MTExMDEwMTExMTAwMTExMTExMDEwMTEwMDEwMDEwMA658%2460%24103=1001111804081407418666685461&locale_cookie=en_US&TOR=a%3A0%3A%7B%7D&gmHyOJiMC3_000123618164375240%2485%24106MTEwMDEwMDAxMTEwMDAxMTExMDEwMDExMTAxMTExMDA%2494%24121%2496=110111122419774682702725-4445&gmHyOJiMC3_00012361828340868127%241883MTEwMTExMTExMDAwMTAxMDExMDAwMTAxMDEwMDAwMTA548%24114123=111111111111111111111111110001112329035287433024939136&gmHyOJiMC3_00012361754471276%246958%2443MTEwMDAwMTEwMDAxMTAxMDAxMTEwMTEwMDAxMDAwMDE30%2477%242%2499=1010001232979768510921477-316&gmHyOJiMC3_000123615403099943%24116%2455MTExMDExMTAwMTExMDAxMDEwMDEwMDExMDExMTAw5032%2428%2465=111111111111111111111111111000012354092137852012438371&gmHyOJiMC3_00012361578034251%2479%241117MTExMDAxMTExMTExMTEwMDAwMDExMDAwMDAxMTAwMA11270%249628=11101012343889074707300-11050&gmHyOJiMC3_0001236172652401%2495141384MTExMTAxMDEwMTAwMDAwMTAxMTExMDEwMDEx1277296763=111111111111111111111111100100012391260420982626442549; __utma=255377421.187917290.1404944435.1421779540.1421792306.74; __utmc=255377421; __utmz=255377421.1418852581.56.2.utmcsr=tag-stage.com|utmccn=(referral)|utmcmd=referral|utmcct=/browse; lithiumSSO%3A=~2w7xtM8xEwdfpxH9E~be2JMdefdJqzIZxnZuZG9wPcVQe_9Hjegim5Bqe0pGchkDHf6Shtv1A5wvt2raB_qiLKewPcfKJP7lk0tMyaSN8FSWAKAw3DU9UzN6x1INw4Rf-cSKifLxDo2ldtNC0UJ9AvXGBWJ7W945RF5ml7KBhroV6kJr2X8OogER6zX5ZyFa4Z_Z7Kf9kWDf43kf2B7cnazdBir0qjPjttQVcCGMMnow4-0ANJvqNe0QJZm_KMIgpPETwDmtvX7RaSZaBiryiWS4Ds7kB7Uc7tK01TXxCGPrTj2RQjpuSUvy3lQjbHdmTGDaxH6pvajEofFKRVloE6X5TFUmPx63M_AGUppw3TQNCEWA3mKcxgfVbs2xqKqxkhvSmd5JsWuyxYMA0A; L=2-B44gSLio6m.1kLJnq.1P74p2u; _ga=GA1.2.141998652.1404410765; _gat=1; S=ll6raatbk9b4c6759gaoovhvk1' -H 'Connection: keep-alive' --data-binary $'\nmethod=tagged.apps.meetme.getMeetmeProfileData&track=MjUzMTUxMj&items_per_page=6&page=0\n' --compressed

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
            cookies: 'L=2-B44gSLio6m.1kLJnq.1P74p2u; S=ll6raatbk9b4c6759gaoovhvk1'
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
