var TaggedAPI = function(endpoint) {
	this.endpoint = endpoint;
};

TaggedAPI.prototype.execute = function(method, params) {
    if (!method || typeof method !== "string") {
        throw "Api method is required";
    }
};

module.exports = TaggedAPI;