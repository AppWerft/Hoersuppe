const USINGCACHE = false;

var Module = function(_key) {
	if (_key && ( typeof _key) == 'String')
		this.key = _key;
	this.eventhandlers = [];
	return this;
};
Module.prototype = {
	start : function(_key) {
		if (_key)
			this.key = _key;
		var that = this;
		this.fireEvent('geturl:start', {
			message : 'Feed-Suche für ' + this.key
		});
		this._getUrl(this.key, function(_url) {
			var contentLength = -1;
			that.cache = Ti.Filesystem.getFile(Ti.Filesystem.getApplicationCacheDirectory(), 'CACHE_' + Ti.Utils.md5HexDigest(_url));
			that.fireEvent('geturl:ready', {
				message : 'Podcast-URL OK'
			});
			that.fireEvent('getfeed:start', {
				message : 'Versuche Feed zu laden …'
			});
			if (USINGCACHE) {
				if (that.cache.exists()) {
					var md5 = Ti.Utils.md5HexDigest(that.cache.read().text);
					var items = JSON.parse(that.cache.read().text);
					that.fireEvent('getfeed:ready', {
						message : items.length + ' Feeds vom lokalen Speicher',
						result : items
					});
					return;
				}
			}
			that.fireEvent('getfeed:start', {
				message : 'Feed nicht lokal, muss ich besorgen'
			});
			var counter = 0;
			var cron = setInterval(function() {
				counter += 0.05;
			}, 500);
			var xhr = Ti.Network.createHTTPClient({
				timeout : 30000,
				ondatastream : function(_e) {
					if (_e.progress > 0)
						that.fireEvent('getfeed:progress', {
							value : _e.progress
						});
					else
						that.fireEvent('getfeed:progress', {
							value : counter
						});
				},
				onerror : function() {
					clearInterval(cron);
				},
				onload : function() {
					clearInterval(cron);
					var head = this.responseText.substr(0, 50);
					console.log(this.getResponseHeader('Server'));
					console.log(this.getResponseHeader('Content-Type'));
					console.log(head);
					if (this.responseXML) {
						var rssobj = new (require("vendor/XMLTools"))(this.responseXML).toObject();
						that.fireEvent('getfeed:ready', {
							result : rssobj.channel.item,
							message : rssobj.channel.item.length + ' Beiträge erhalten.'
						});
						that.cache.write(JSON.stringify(rssobj.channel.item));
					} else {
						var counter = 0;
						/*var cron = setInterval(function() {
							counter += 0.1;
							that.fireEvent('getfeed:progress', {
								value : counter
							});
						}, 1000);*/
						var yql = 'SELECT * FROM xml WHERE url="http://' + _url + '"';
						that.fireEvent('getfeed:start', {
							message : 'Feed über yql besorgen …'
						});
						Ti.Yahoo.yql(yql, function(_y) {
							//clearInterval(cron);
							if (_y.data) {
								var items = _y.data.rss.channel.item;

								that.cache.write(JSON.stringify(items));
								that.fireEvent('getfeed:ready', {
									message : items.length + ' Beiträge gefunden',
									result : items
								});
							} else {
								console.log('Error: Feed nicht lesbar');
								that.fireEvent('error');
							}
						});
						//_callback(null);

					}
				}
			});
			xhr.open('GET', _url, true);
			xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2');
			xhr.setRequestHeader('Accept', 'application/rss+xml');
			xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
			xhr.send();
		});
	},
	_getUrl : function(key, callback) {
		var that = this;
		if (Ti.App.Properties.hasProperty('RSSURL' + key)) {
			var url = Ti.App.Properties.getString('RSSURL' + key);
			that.fireEvent('geturl:ready', {
				message : 'Feed-URL OK'
			});
			callback(url);
			return;
		}var counter =0;
		var cron = setInterval(function() {
				counter += 0.05;
			}, 500);
		var self = Ti.Network.createHTTPClient({
			onerror : function() {
				clearInterval(cron);
				that.fireEvent('geturl:error', {
					message : this.error
				});
				console.log('Error: ' + this.error);
			},
			onload : function() {
				clearInterval(cron);
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
					value : counter,
					message : 'Fortschritt: ' + Math.round(100 * counter) + '%'
				});
			}
		});
		self.open('GET', 'http://hoersuppe.de/podcast/' + key, true);
		self.send();
	},

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
