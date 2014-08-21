module.exports = function(_key, _callback) {
	function getUrl(key, callback) {
		if (Ti.App.Properties.hasProperty('RSSURL' + key)) {
			callback(Ti.App.Properties.getString('RSSURL' + key));
			return;
		}
		Ti.UI.createNotification({
			message : 'Hole FeedAdresse aus dem Netz.'
		}).show();
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
		var cache = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationCacheDirectory(),'CACHE_' + Ti.Utils.md5HexDigest(_url));
		if (cache.exists()) {
			var md5 = Ti.Utils.md5HexDigest(cache.read().text);
			var items = JSON.parse(cache.read().text);
			_callback(items);
		}
		else Ti.UI.createNotification({
			message : 'Hole den Feed aus dem Netz …'
		}).show();
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				Ti.UI.createNotification({
					message : Math.round(this.responseText.length / 1000) + ' kB'
				}).show();
				try {
					var rssobj = new (require("vendor/XMLTools"))(this.responseXML).toObject();
					_callback(rssobj.channel.item);
					cache.write(JSON.stringify(rssobj.channel.item));
					console.log('Info: ITEMS saved');
				} catch(E) {
					var yql = 'SELECT * FROM xml WHERE url="http://' + _url + '"';
					console.log(yql);
					Ti.Yahoo.yql(yql, function(_y) {
						if (_y.data) {
							var items = _y.data.rss.channel.item;
							cache.write(JSON.stringify(items));
							_callback(items);
						} else _callback(null);
					});
					//_callback(null);
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
