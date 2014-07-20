var TaggedAPI = require(LIB_DIR);
var NodeHttpAdapter = require(LIB_DIR + '/http_adapter/node');
var Q = require('q');

describe('Integration', function() {
    // curl 'http://www.tag-stage.com/api/?application_id=user&format=JSON&session_token=55nidkpnkl0os7folv7hn7opi2' -H 'Cookie: B=b=F8959BDBCDEBB746; __qca=P0-1811499868-1405705851931; nf_filters_seen=true; __gads=ID=d7f713feeb29b43a:T=1405710163:S=ALNI_MbyVMQwJjH86Cr6xppIjKbSqu35CA; toast_inactivity=1405710188758; nf_filters_shown=false; L=2VoMqWYcW_64.1jO_dK.1P74p2u; lithiumSSO%3A=~2vWhzl2R2swQrEjni~HdkvjsVw61Bh5g7k7q7P5wEalBI_GrgbkqHihj_T9BvzMBHQSlDVLCgATCAFVyKW2PfOA7BlPh0noutPWEL4bQ0ZIQGOKYwWv8huF2AS8MNgA-Av8HYW6ylUQVPd73zpKDX0uwLZyzFXBN-PuiZBMxujxXchHuprU1vsMQiQTikj2V_0N-DSTHrKhAl22lYzxKLVpuarbTnIf_AHimvl-3-vp7MLtZ_CcjhpLHryWH6ZpI57AUuA2G145MqV_0GK5a4hQYuwZeDOUhMDQ5dvZMhvkBDownj7d16SfOBiAlLhXRLFMCtIEzxeAR0WbbUNd14EQ37CrZ3_kAJr2BRPw-Xag1Zzwpm9gi9r8nU7x9wnV3va2S08u1n29o-vcSLXpS9pw04N8fOUm95XeKy5KUq0ZG6Ivx4cUg13vA51jMsbL1La-4WvNb0wtYvvdptL; __utma=255377421.526982440.1405710147.1405713289.1405875042.3; __utmb=255377421.0.10.1405875042; __utmc=255377421; __utmz=255377421.1405710147.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __ar_v4=66J7EMJVFNF2FAEM5PBEIG%3A20140717%3A3%7CLTMUNUXRWFHBFA24S4T7KA%3A20140717%3A7%7CK742OAO7V5H3RK2RHZOYRM%3A20140717%3A7%7CFDYSWRR2JFCGBJ3GNOR4YH%3A20140717%3A4; S=55nidkpnkl0os7folv7hn7opi2' -H 'Origin: http://www.tag-stage.com' -H 'Accept-Encoding: gzip,deflate,sdch' -H 'Accept-Language: en-US,en;q=0.8' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept: */*' -H 'Cache-Control: max-age=0' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' -H 'Referer: http://www.tag-stage.com/home.html?jli=1' --data $'\nmethod=tagged.alerts.get&api_signature=&track=ya9GupbsRi&count=7\n' --compressed

    beforeEach(function() {
        this.http = new NodeHttpAdapter();
        this.api = new TaggedAPI('http://www.tag-stage.com/api/', {
            query: {
                application_id: 'user',
                format: 'JSON',
                session_token: '55nidkpnkl0os7folv7hn7opi2'
            },
            params: {
                api_signature: '',
                track: 'ya9GupbsRi'
            },
            cookies: 'B=b=F8959BDBCDEBB746; __qca=P0-1811499868-1405705851931; nf_filters_seen=true; __gads=ID=d7f713feeb29b43a:T=1405710163:S=ALNI_MbyVMQwJjH86Cr6xppIjKbSqu35CA; toast_inactivity=1405710188758; nf_filters_shown=false; L=2VoMqWYcW_64.1jO_dK.1P74p2u; lithiumSSO%3A=~2vWhzl2R2swQrEjni~HdkvjsVw61Bh5g7k7q7P5wEalBI_GrgbkqHihj_T9BvzMBHQSlDVLCgATCAFVyKW2PfOA7BlPh0noutPWEL4bQ0ZIQGOKYwWv8huF2AS8MNgA-Av8HYW6ylUQVPd73zpKDX0uwLZyzFXBN-PuiZBMxujxXchHuprU1vsMQiQTikj2V_0N-DSTHrKhAl22lYzxKLVpuarbTnIf_AHimvl-3-vp7MLtZ_CcjhpLHryWH6ZpI57AUuA2G145MqV_0GK5a4hQYuwZeDOUhMDQ5dvZMhvkBDownj7d16SfOBiAlLhXRLFMCtIEzxeAR0WbbUNd14EQ37CrZ3_kAJr2BRPw-Xag1Zzwpm9gi9r8nU7x9wnV3va2S08u1n29o-vcSLXpS9pw04N8fOUm95XeKy5KUq0ZG6Ivx4cUg13vA51jMsbL1La-4WvNb0wtYvvdptL; __utma=255377421.526982440.1405710147.1405713289.1405875042.3; __utmb=255377421.0.10.1405875042; __utmc=255377421; __utmz=255377421.1405710147.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); __ar_v4=66J7EMJVFNF2FAEM5PBEIG%3A20140717%3A3%7CLTMUNUXRWFHBFA24S4T7KA%3A20140717%3A7%7CK742OAO7V5H3RK2RHZOYRM%3A20140717%3A7%7CFDYSWRR2JFCGBJ3GNOR4YH%3A20140717%3A4; S=55nidkpnkl0os7folv7hn7opi2'
        }, this.http);
    });

    describe('tagged.alerts.get', function() {
        it('responds with stat: ok', function() {
            return this.api.execute('tagged.alerts.get', {
                count: 7
            }).should.eventually.have.property('stat', 'ok');
        });

        it('responds with result array', function() {
            return this.api.execute('tagged.alerts.get', {
                count: 7
            }).then(function(result) {
                result.should.have.property('result');
                result.result.should.be.an('Array');
                // Note: Asserting the specific values of the the result array would be too flaky
            });
        });
    });
});
