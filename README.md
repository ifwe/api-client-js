Tagged API Client
=================

The Tagged API client allows you to make API calls to Tagged.com in node or in the browser.

Installation
------------

**node.js**

    $ npm install tagged-api

**browser**

    $ bower install tagged-api

Getting Started
---------------

**node.js**

```js
// Low level access
var TaggedApi = require('tagged-api');
var api = new TaggedApi('http://www.tagged.com/api.php', {
    clientId: /* your Tagged client id */,
    secret: /* your Tagged client secret */,
    session_id: 'abc123', // Session cookie ID from request
    timeout: 10000        // Set http timeout (default 10s)
});

// Or use middleware to automatically create an api instance for each request
var connect = require('connect');
var app = connect();
var TaggedApi = require('tagged-api');
app.use(TaggedApi.middleware(host, {
    clientId: /* your Tagged client id */,
    secret: /* your Tagged client secret */,
    passHeaders: [        // The following list of headers will be passed from the client to the API server
        'user-agent',
        'x-forwarded-for'
    ],
    timeout: 10000        // Set http timeout (default 10s)
}));

app.get('/', function(req, res) {
    // Make API calls on behalf of the user that is authenticated with this request
    req.api.execute('user.whoami').then(function(result) {
        res.send(result);
    }).done();
});
```

**browser**

```js
<script src="bower_components/tagged-api/tagged-api-min.js"></script>
<script>
var api = new TaggedApi('/api.php', {
    session_id: 'abc123' // Session cookie ID from `document.cookie`
});
</script>
```

Executing API Calls
-------------------

To make an API call, use `.execute()`, which returns a promise:

```js
// Same API in either environment:
api.execute('im.send', {
    to: 12345,
    message: 'Join the party!'
}).then(function(result) {
    // Process `result`
}).catch(function(error) {
    // Handle `error`
}).done();
```

**Note:** All API calls are executed on behalf of the authenticated user, or anonymously if not
authenticated. **Executing API calls on behalf of another user is not supported.**

Executing Multiple API Calls
----------------------------

Executing multiple API calls is exactly like executing one -- just make multiple calls to `api.execute()`.
The Tagged API Client will automatically batch multiple calls together into a single HTTP request
to improve network performance.

```js
// All of the following calls will be placed into a queue and
// sent as a single HTTP request on the next tick:
api.execute(method1, params1).then(handler1).done();
api.execute(method2, params2).then(handler2).done();
api.execute(method3, params3).then(handler3).done();
```

If you need to wait for all API calls to complete before processing the result, use any promise
library that supports `.all()`, such as [`Q`](https://github.com/kriskowal/q):

```js
var Q = require('q');
Q.all([
    api.execute(method1, params1),
    api.execute(method2, params2),
    api.execute(method3, params3)
]).then(function(results) {
    // Each result will be available in the `results` array
}).catch(function(error) {
    // If any of the promises fail, this handler will be called with the reason
}).done();
```

Using the Event Emitter
-----------------------

With the latest version of this API, you can now use the the `on` function to push a callback upon
hearing a certain status using promises.

```js
var send = function() {
    // Function code.
    done();
}
this.api.on('MESSAGE_RECIEVED', send);
```
