var Module = function(_key) {
	this.eventhandlers = [];
	var that = this;
	function getUrl(key, callback) {
		if (Ti.App.Properties.hasProperty('RSSURL' + key)) {
			var url = Ti.App.Properties.getString('RSSURL' + key);
			that.fireEvent('geturl:ready', {
				message : 'Feed-URL OK'
			});
			callback(url);
			return;
		}
		var self = Ti.Network.createHTTPClient({
			onerror : function() {
				that.fireEvent('geturl:error', {
					message : this.error
				});
				console.log('Error: ' + this.error);
			},
			onload : function() {
				var page = this.responseText;
				var regex = /"pcast:\/\/(.*?)"/mg;
				var res = regex.exec(page);
				if (res) {
					var url = res[1];
					Ti.App.Properties.setString('RSSURL' + key, url);
					that.fireEvent('geturl:ready', {
						value : url,
						message : 'FeedURL OK'
					});
					callback(url);
				} else {
					console.log('Error: urlpage found, but without link to pcast on it');
					that.fireEvent('geturl:error', {});
				}
			},
			ondatastream : function(_e) {
				that.fireEvent('geturl:progress', {
					value : _e.progress,
					message : 'Fortschritt: ' + Math.round(100 * _e.progress) + '%'
				});

			}
		});
		self.open('GET', 'http://hoersuppe.de/podcast/' + _key, true);
		self.send();
	}

	/* START */
	that.fireEvent('geturl:start', {
		message : 'Start der URL-Suche für ' + _key
	});
	getUrl(_key, function(_url) {
		that.fireEvent('geturl:ready', {
			message : 'Podcast-URL OK'
		});
		that.fireEvent('getfeed:start', {
			message : 'Versuche Feed zu laden …'
		});
		var cache = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationCacheDirectory(), 'CACHE_' + Ti.Utils.md5HexDigest(_url));
		if (cache.exists()) {
			var md5 = Ti.Utils.md5HexDigest(cache.read().text);
			var items = JSON.parse(cache.read().text);
			that.fireEvent('parse:ready', {
				message : 'lokaler Feed schon geparst',
			});
			that.fireEvent('getfeed:ready', {
				message : items.length + ' Feeds vom lokalen Speicher',
				result : items
			});
			return;
		}
		that.fireEvent('getfeed:start', {message:'Feed nicht lokal, muss ich besorgen'});
		var xhr = Ti.Network.createHTTPClient({
			timeout : 30000,
			ondatastream : function(_e) {
				that.fireEvent('getfeed:progress', {
					value : _e.progress
				});
			},
			onload : function() {
				try {
					that.fireEvent('getfeed:ready', {
						value : responseData.length
					});
					that.fireEvent('parse:start', {});
					// xml => json:
					var rssobj = new (require("vendor/XMLTools"))(this.responseXML).toObject();
					that.fireEvent('parse:ready', {
						result : rssobj.channel.item
					});
					cache.write(JSON.stringify(rssobj.channel.item));
					console.log('Info: ITEMS saved');
				} catch(E) {
					var yql = 'SELECT * FROM xml WHERE url="http://' + _url + '"';
					that.fireEvent('getfeed:start', {
						message : 'Feed über yql besorgen …'
					});
					Ti.Yahoo.yql(yql, function(_y) {
						if (_y.data) {
							var items = _y.data.rss.channel.item;
							cache.write(JSON.stringify(items));
							that.fireEvent('getfeed:ready', {
								message : items.length + ' Feeds gefunden',
								result : items
							});
						} else {
							console.log('Error: Feed nicht lesbar');
						}
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
	return this;
};

Module.prototype = {
	fireEvent : function(_event, _payload) {
		//console.log('Info: try to fire event ' + _event);
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	addEventListener : function(_event, _callback) {
		console.log('Info: try to add event ' + _event);
		if (!this.eventhandlers[_event])
			this.eventhandlers[_event] = [];
		this.eventhandlers[_event].push(_callback);
	},
	removeEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			return;
		var newArray = this.eventhandlers[_event].filter(function(element) {
			return element != _callback;
		});
		this.eventhandlers[_event] = newArray;
	}
};
module.exports = Module;
