var VanillaAdapter = function(XMLHttpRequest, Promise) {
    this._xmlhttprequest = XMLHttpRequest;
    this._headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };
    this._promise = Promise;
    this._timeout = 10000;
}

VanillaAdapter.prototype.setTimeout = function(timeout) {
    this._timeout = parseInt(timeout, 10) || timeout;
}

VanillaAdapter.prototype.setHeader = function(key, value) {
    this._headers[key] = value;
};

VanillaAdapter.prototype.setHeaders = function(headers) {
    for (var key in headers) {
        if (!headers.hasOwnProperty(key)) {
            continue;
        }
        this.setHeader(key, headers[key]);
    }
};

VanillaAdapter.prototype.post = function(req) {
    return new this._promise(function(resolve, reject) {
        var xhr = new this._xmlhttprequest();
        xhr.open('POST', req.url, true);
        Object.keys(this._headers).forEach(function(key) {
            xhr.setRequestHeader(key, this._headers[key]);
        }.bind(this));
        xhr.timeout = this._timeout;
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            try {
                var body = JSON.parse(xhr.responseText);
            } catch (e) {
                reject(e);
            }
            resolve(body);
        };
        xhr.send(req.body);
    }.bind(this));
}

module.exports = VanillaAdapter;
