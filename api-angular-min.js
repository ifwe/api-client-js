!function(){"use strict";function a(b,c){for(var d in c)if(c.hasOwnProperty(d))try{b[d]=c[d].constructor===Object?a(b[d],c[d]):c[d]}catch(e){b[d]=c[d]}return b}var b="undefined"!=typeof exports?exports:window,c=b.btoa||require("btoa");if("function"==typeof require)var d=b.Promise||require("bluebird");var e=/; */,f=function(b,c,d){if(this._endpoint=b,this._http=d,this._queue=[],this._batchTimeout=null,this._options=a({query:{},params:{track:this._generateTrackId()},timeout:1e4},c||{}),this._cookies={},c.cookies){var f=c.cookies.split(e);f.forEach(function(a){var b=a.split("=",2);this._cookies[b[0]]=b[1]}.bind(this))}var g=parseInt(this._options.timeout,10)||1e4;0>g&&(g=1e4),this._http.setTimeout(g),this._events={}};f.prototype._generateTrackId=function(){return c(1e8*Math.random()).substr(0,10)},f.prototype.execute=function(b,c){if(!b||"string"!=typeof b)throw new Error("Method is required to execute API calls");var e=new d(function(d,e){var f=a({},this._options.params);this._queue.push({method:b,params:a(f,c||{}),deferred:{resolve:d,reject:e}}),null===this._batchTimeout&&(this._batchTimeout=setTimeout(this._postToApi.bind(this),1))}.bind(this));return e},f.prototype._postToApi=function(){var a=j(this._queue),b={};for(var c in this._options.query)b[c]=this._options.query[c];var d=[];for(var e in b)b.hasOwnProperty(e)&&d.push(e+"="+b[e]);var f=d.join("&");this._http.post({body:a,url:this._endpoint+"?"+f,cookies:this._options.cookies,clientId:this._options.clientId,secret:this._options.secret,headers:this._options.headers||{}}).then(g).then(h.bind(this,this._queue)).catch(i.bind(this,this._queue)),this.resetQueue()};var g=function(a){var b=[],c=JSON.parse(a.body);for(var d in c)b.push(JSON.parse(c[d]));return b},h=function(a,b){for(var c in a){var d=b[c];if(d.stat&&this._events.hasOwnProperty(d.stat))for(var e in this._events[d.stat])this._events[d.stat][e](a[c],d);d.stat&&"ok"!==d.stat?a[c].deferred.reject(d):a[c].deferred.resolve(d)}return b},i=function(a,b){for(var c in a)a[c].deferred.reject(b);return b};f.prototype.resetQueue=function(){null!==this._batchTimeout&&(clearTimeout(this._batchTimeout),this._batchTimeout=null),this._queue=[]},f.prototype.on=function(a,b){this._events.hasOwnProperty(a)||(this._events[a]=[]),this._events[a].push(b)},f.middleware=function(b,c){var d=require("./http_adapter/node"),e=new d;return function(d,g,h){var i={query:{application_id:"user",format:"JSON"},params:{api_signature:""},cookies:d.headers&&d.headers.cookie,headers:{}};if(c&&c.passHeaders)for(var j=0,k=c.passHeaders.length;k>j;j++){var l=c.passHeaders[j];d.headers.hasOwnProperty(l)&&(i.headers[l]=d.headers[l])}d.api=new f(b,a(i,c||{}),e),h()}};var j=function(a){var b=[];for(var c in a){var d=k(a[c]);b.push(d)}return"\n"+b.join("\n")+"\n"},k=function(a){var b=["method="+encodeURIComponent(a.method)];for(var c in a.params)null!==a.params[c]&&a.params.hasOwnProperty(c)&&b.push(l(c,a.params[c]));return b.join("&")},l=function(a,b){var c=typeof b;switch(c){case"string":case"number":case"boolean":return m(a,b);case"undefined":return m(a,"");case"object":return null===b?m(a,b):n(a,b);default:throw new Error("Unable to parameterize key "+a+" with type "+c)}},m=function(a,b){return encodeURIComponent(a)+"="+encodeURIComponent(b)},n=function(a,b){var c=[];if(Array.isArray(b))for(var d=0,e=b.length;e>d;d++)c.push(encodeURIComponent(a)+"[]="+encodeURIComponent(b[d]));else for(var f in b)b.hasOwnProperty(f)&&c.push(encodeURIComponent(a)+"["+encodeURIComponent(f)+"]="+encodeURIComponent(b[f]));return c.join("&")};"undefined"!=typeof exports?module.exports=f:b.TaggedApi=f}(),function(){"use strict";function a(a,b){this._$http=a,this._$window=b,this._timeout=1e4}var b="undefined"!=typeof exports?exports:window;a.$inject=["$http","$window"],a.prototype.setTimeout=function(a){this._timeout=parseInt(a,10)||1e4},a.prototype.post=function(a){var b={"x-tagged-client-id":a.clientId,"x-tagged-client-url":this._$window.location.href,"Content-Type":"application/x-www-form-urlencoded; charset=UTF-8","X-Requested-With":"XMLHttpRequest"};return this._$http.post(a.url,a.body,{timeout:this._timeout,transformResponse:c,headers:b}).then(d)};var c=function(a){return a},d=function(a){return{body:a.data}};if("undefined"!=typeof exports)module.exports=a;else{var e=b.TaggedApi||{};e.AngularAdapter=a}}(),function(){"use strict";var a=function(a,b){function c(a,c,d){var e=new b.AngularAdapter(a,d),f=new b("/api/",{query:{application_id:"user",format:"json"},clientId:this.clientId,timeout:this.timeout},e);return f.execute=function(a,d){return c.when(b.prototype.execute.call(this,a,d))},f}var d=a.module("tagged.service.api",[]);d.factory("taggedApi",c),c.$inject=["$http","$q","$window"],c.timeout=1e4};"undefined"!=typeof exports?module.exports=a:TaggedApi.angularWrapper=a}(),TaggedApi.angularWrapper(angular,TaggedApi);