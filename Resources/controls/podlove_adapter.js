module.exports = function(callback) {
	var self = Ti.Network.createHTTPClient({
		onload : function() {
			callback({
				success : true,
				posts : JSON.parse(this.responseText).posts
			});

		}
	});
	self.open('GET', 'http://podbe.de/?json=1&dev=1');
	self.send();
};
