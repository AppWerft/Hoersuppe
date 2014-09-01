module.exports = function(callback) {
	/*if (Ti.App.Properties.hasProperty('PODLOVE'))
		callback(Ti.App.Properties.getList('PODLOVE'));*/
	var self = Ti.Network.createHTTPClient({
		onload : function() {
			var posts = JSON.parse(this.responseText).posts;
			Ti.App.Properties.setList('PODLOVE', posts);
			callback({
				success : true,
				posts : posts
			});

		}
	});
	self.open('GET', 'http://podbe.de/?json=1&dev=1');
	self.send();
};
