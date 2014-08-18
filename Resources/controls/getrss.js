module.exports = function(_key, _callback) {
	var self = Ti.Network.createHTTPClient({
		onload : function() {
			var page = this.responseText;
			var regex = /"pcast:\/\/(.*?)"/mg;
			var res = regex.exec(page);
			if (res) {
				Ti.UI.createNotification({
					message : 'Hole ' + res[1]
				}).show();
				var url = 'http://' + res[1];
				var xhr = Ti.Network.createHTTPClient({
					onload : function() {
						Ti.UI.createNotification({
							message : Math.round(this.responseText.length / 1000) + ' kB'
						}).show();
						try {
							var res = new (require("vendor/XMLTools"))(this.responseXML).toObject();
							_callback(res.channel.item);
						} catch(E) {
							
							_callback(null);
							console.log(E);
						}
					}
				});
				xhr.open('GET', url);
				xhr.send();
				console.log(url);
			}
		}
	});
	self.open('GET', 'http://hoersuppe.de/podcast/' + _key, true);
	self.send();
};
