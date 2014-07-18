var memwatch = require('memwatch');
var TaggedAPI = require('../lib');
var HttpMock = require('./lib/mocks/http.js');
global.sinon = require('sinon');

memwatch.on('leak', function(data) {
    console.log('leak', data);
});

memwatch.on('stats', function(stats) {
    console.log('max', stats.max);
});

var http = new HttpMock();
var api = new TaggedAPI('/api.php', http);

setInterval(function() {
    var clock = global.sinon.useFakeTimers();

    api.execute('im.send').then(function(data) {
        // console.log('success', data);
    }).catch(function(error) {
        console.log('error', error);
    }).done();

    clock.tick(1);

    http.resolve({
        // ugly response body :(
        body: '["{\\"foo\\":\\"bar\\"}"]'
    });
    clock.restore();
}, 1);
