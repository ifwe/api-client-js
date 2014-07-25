!function(){function a(b,c){for(var d in c)if(c.hasOwnProperty(d))try{b[d]=c[d].constructor===Object?a(b[d],c[d]):c[d]}catch(e){b[d]=c[d]}return b}var b="undefined"!=typeof exports?exports:window,c=b.btoa||require("btoa"),d=b.Promise||require("bluebird"),e=function(b,c,d){this._endpoint=b,this._http=d,this._queue=[],this._batchTimeout=null,this._options=a({query:{},params:{track:this._generateTrackId()},cookies:""},c||{})};e.prototype._generateTrackId=function(){return c(1e8*Math.random()).substr(0,10)},e.prototype.execute=function(b,c){if(!b||"string"!=typeof b)throw new Error("Method is required to execute API calls");var e=new d(function(d,e){this._queue.push({method:b,params:a(this._options.params,c||{}),deferred:{resolve:d,reject:e}}),null===this._batchTimeout&&(this._batchTimeout=setTimeout(this._postToApi.bind(this),1))}.bind(this));return e},e.prototype._postToApi=function(){var a,b=i(this._queue),c=[];for(var d in this._options.query)c.push(d+"="+this._options.query[d]);a=c.join("&"),this._http.post({body:b,url:this._endpoint+"?"+a,cookies:this._options.cookies}).then(f).then(g.bind(this,this._queue)).catch(h.bind(this,this._queue)),this.resetQueue()};var f=function(a){var b=[],c=JSON.parse(a.body);for(var d in c)b.push(JSON.parse(c[d]));return b},g=function(a,b){for(var c in a){var d=b[c];d.stat&&"ok"!==d.stat?a[c].deferred.reject(d.stat):a[c].deferred.resolve(d)}return b},h=function(a,b){for(var c in a)a[c].deferred.reject(b);return b};e.prototype.resetQueue=function(){null!==this._batchTimeout&&(clearTimeout(this._batchTimeout),this._batchTimeout=null),this._queue=[]},e.middleware=function(b,c){var d=require("./http_adapter/node"),f=new d;return function(d,g,h){d.api=new e(b,a({cookies:d.headers&&d.headers.Cookie},c||{}),f),h()}};var i=function(a){var b=[];for(var c in a){var d=j(a[c]);b.push(d)}return"\n"+b.join("\n")+"\n"},j=function(a){var b=["method="+encodeURIComponent(a.method)];for(var c in a.params)null!==a.params[c]&&a.params.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a.params[c]));return b.join("&")};"undefined"!=typeof exports?module.exports=e:this.TaggedApi=e}(),function(){"use strict";function a(a){this._$http=a}{var b="undefined"!=typeof exports?exports:window;b.Promise||require("bluebird")}a.$inject=["$http"],a.prototype.post=function(a){return this._$http.post(a.url,a.body,{timeout:1e4}).then(c)};var c=function(a){return{body:a.data}};if("undefined"!=typeof exports)module.exports=a;else{var d=b.TaggedApi||{};d.AngularAdapter=a}}(),function(){"use strict";var a=function(a,b){function c(a){var c=new b.AngularAdapter(a);return new b("/api",{},c)}var d=a.module("tagged.service.api",[]);d.factory("taggedApi",c),c.$inject=["$http"]};"undefined"!=typeof exports?module.exports=a:TaggedApi.angularWrapper=a}(),TaggedApi.angularWrapper(angular,TaggedApi);