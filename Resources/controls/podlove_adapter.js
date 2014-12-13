module.exports = function(callback) {
	if (Ti.App.Properties.hasProperty('PODLOVE'))
		callback(Ti.App.Properties.getList('PODLOVE'));
	var self = Ti.Network.createHTTPClient({
		onload : function() {
			var data = JSON.parse(this.responseText);
			Ti.App.Properties.setList('PODLOVE', data.posts);
			callback({
				success : data.status,
				posts : data.posts
			});

		}
	});
	self.open('GET', 'http://podbe.de/?json=1&dev=1');
	self.send();
};
