function getFilehandle(file) {
	return (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, file) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + '.meta');
}

var Hoersuppe = function() {
	this.eventhandlers = [];
	return this;
};

Hoersuppe.prototype = {
	saveAudioFile : function(item, callback) {
		var that= this;
		var filename = Ti.Utils.md5HexDigest(item.url);
		var audiofile = getFilehandle(filename);
		var metafile = getFilehandle(filename + '.meta');
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				console.log('Info: XHR-STATUS: ' + this.status);
				if (this.status == 200) {
					console.log('Info: STATUS 200');
					audiofile.write(this.responseData);
					console.log('Info: AUDIO saved');
					metafile.write(JSON.stringify(item));
					console.log('Info: META saved');
					callback.onsaved && callback.onsaved();
				};
			},
			ondatastream : function(e) {
				that.trigger('progress:' + filename, {
					progress : 100 * parseFloat(e.progress)
				});
			}
		});
		xhr.open('GET', item.url);
		xhr.send();
		Ti.Media.vibrate();
		return xhr;
	},
	getAll : function() {
		var folder = getFilehandle('');
		var dir_files = folder.getDirectoryListing('');
		var metalist = [];
		for (var i = 1; i < dir_files.length; i++) {
			if (!dir_files[i].match(/\.meta$/))
				continue;
			mp3name = dir_files[i].replace('.meta', '');
			var meta = getFilehandle(dir_files[i]);
			var mp3 = getFilehandle(mp3name);
			if (mp3.exists()) {
				var item = JSON.parse(meta.read().text);
				item.url = mp3.nativePath;
				metalist.unshift(item);
			}
		}
		return metalist;
	},
	isSaved : function(url) {
		var file = getFilehandle(Ti.Utils.md5HexDigest(url));
		return file.exist();
	},
	trigger : function(_event, _payload) {
		console.log('Info: try to fire event ' + _event);
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	on : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			this.eventhandlers[_event] = [];
		this.eventhandlers[_event].push(_callback);
	},
	off : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			return;
		var newArray = this.eventhandlers[_event].filter(function(element) {
			return element != _callback;
		});
		this.eventhandlers[_event] = newArray;
	},
};
module.exports = Hoersuppe;
