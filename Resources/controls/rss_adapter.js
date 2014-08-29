const USINGCACHE = true;

var Module = function(_key, _reload) {
	if (_key && ( typeof _key) == 'String')
		this.key = _key;
	this.eventhandlers = [];
	return this;
};
Module.prototype = {
	start : function(_key, _reload) {
		if (_key)
			this.key = _key;
		var that = this;
		this.fireEvent('geturl:start', {
			message : 'Feed-Suche für „' + this.key + '“'
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
			if (USINGCACHE && !_reload) {
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
				message : (_reload) ? '' : 'Feed nicht parat, muss ich besorgen …'
			});
			var counter = 0;
			var cron = setInterval(function() {
				counter += 0.05;
			}, 500);
			var xhr = Ti.Network.createHTTPClient({
				timeout : 20000,
				autoRedirect : false,
				cache : false,
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
					that.fireEvent('error');
				},
				onload : function() {
					clearInterval(cron);
					var head = this.responseText;
					that.fireEvent('getfeed:progress', {
						progress : 1,
						message : (this.responseText.length / 1024).toFixed(1) + ' kB von ' + this.getResponseHeader('Server') + '  erhalten.'
					});
					if (this.responseXML) {
						var elements = this.responseXML.documentElement.getElementsByTagName('item');
						var data = [];
						for (var i = 0; i < elements.length; i++) {
							var element = elements.item(i);
							try {
								var description = (element.getElementsByTagName('description').item(0)) ? element.getElementsByTagName('description').item(0).textContent : '';
								data.push({
									enclosure : {
										url : element.getElementsByTagName('enclosure').item(0).getAttribute('url'),
										length : element.getElementsByTagName('enclosure').item(0).getAttribute('length')
									},
									description : description,
									title : element.getElementsByTagName('title').item(0).textContent,
									pubDate : element.getElementsByTagName('pubDate').item(0).textContent
								});
							} catch(E) {
								console.log('Error: ' + E);
							}
						};
						that.fireEvent('getfeed:ready', {
							result : data,
							message : data.length + ' Beiträge erhalten.'
						});
						that.cache.write(JSON.stringify(data));
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
			var url = (_url.search('http') == 0) ? _url : 'http://' + _url;
			xhr.open('GET', url, true);
			xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (KHTML, like Gecko)');
			xhr.setRequestHeader('Accept', 'application/rss+xml');
			xhr.setRequestHeader('Cookie', null);
			xhr.setRequestHeader('Accept-Encoding', 'gzip, deflate');
			xhr.send();
		});
	},
	_getUrl : function(key, callback) {
		var that = this;
		if (key.search('http://') == 0 || key.search('https://') == 0) {
			callback(key);
			return;
		}
		if (Ti.App.Properties.hasProperty('RSSURL' + key)) {
			var url = key && Ti.App.Properties.getString('RSSURL' + key);
			callback(url);
			return;
		}
		var counter = 0;
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
