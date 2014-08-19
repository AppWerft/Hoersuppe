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
					var url = res[1];
					Ti.App.Properties.setString('RSSURL' + key, url);
					callback(url);
				}
			}
		});
		self.open('GET', 'http://hoersuppe.de/podcast/' + _key, true);
		self.send();
	}

	getUrl(_key, function(_url) {
		if (Ti.App.Properties.hasProperty('ITEMS' + _url)) {
			//callback(Ti.App.Properties.getList('ITEMS' + _url));
		}
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				console.log(this.responseText.substr(32));
				Ti.UI.createNotification({
					message : Math.round(this.responseText.length / 1000) + ' kB'
				}).show();
				try {
					var items = new (require("vendor/XMLTools"))(this.responseXML).toObject().channel.item;
					console.log(items);				
					Ti.App.Properties.setList('ITEMS' + url, items);
					_callback(items);
				} catch(E) {
					_callback(null);
					console.log(E);
				}
			}
		});
		xhr.open('GET', _url, true);
		xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2');
		xhr.setRequestHeader('Accept', 'application/rss+xml');
		xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
		xhr.send();
	});

};
