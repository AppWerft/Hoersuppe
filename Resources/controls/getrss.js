module.exports = function(_key, _callback) {
	function getUrl(key, callback) {
		if (Ti.App.Properties.hasProperty('RSSURL' + key)) {
			callback(Ti.App.Properties.getString('RSSURL' + key));
			return;
		}
		var self = Ti.Network.createHTTPClient({
			onload : function() {
				var page = this.responseText;
				var regex = /"pcast:\/\/(.*?)"/mg;
				var res = regex.exec(page);
				if (res) {
					var url = res[0];
					Ti.App.Properties.setString('RSSURL' + key, url);
					callback(url);
				}
			}
		});
		self.open('GET', 'http://hoersuppe.de/podcast/' + _key, true);
		self.send();
	}

	getUrl(_key, function(_url) {
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				console.log(this.responseText);
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
		xhr.open('GET', url, true);
		xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2');
		xhr.setRequestHeader('Accept', 'application/rss+xml');
		xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
		xhr.send();
	});

};
