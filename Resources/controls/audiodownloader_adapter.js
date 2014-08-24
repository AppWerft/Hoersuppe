/* helper function to detect save place */
function getFilehandle(file) {
	return (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, file) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + '.meta');
}

/* Constructor */
var Module = function() {
	this.eventhandlers = [];
	// collector for handlers
	return this;
};

/* prototyped methods */
Module.prototype = {
	deleteAudioFile : function(item) {
		if (!item || !item.url)
			return;
		var filename = Ti.Utils.md5HexDigest(item.url);
		var audiofile = Ti.Filesystem.getFile(item.url);
		audiofile.deleteFile();
		var metafile = Ti.Filesystem.getFile(item.url + '.meta');
		metafile.deleteFile();
	},
	saveAudioFile : function(item, callback) {
		var that = this;
		var filename = Ti.Utils.md5HexDigest(item.url);
		var audiofile = getFilehandle(filename);
		var metafile = getFilehandle(filename + '.meta');
		var xhr = Ti.Network.createHTTPClient({
			onload : function() {
				if (this.status == 200) {
					audiofile.write(this.responseData);
					metafile.write(JSON.stringify(item));
					that.trigger('ready', {});
				};
			},
			/* sending of progress for all subscribers */
			ondatastream : function(_e) {
				if (Math.round((new Date()).getTime() / 1000) % 2) {
					that.trigger('progress', {
						progress : Math.round(100 * parseFloat(_e.progress))
					});
				};
			}
		});
		xhr.open('GET', item.url, true);
		xhr.send(null);
		Ti.Media.vibrate();
		return xhr;
		// to have a reference for caler to abort()
	},
	trigger : function(_event, _payload) {
		//console.log('Info: try to fire event ' + _event);
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	addEventListener : function(_event, _callback) {
		console.log('Info: try to add event ');
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
	},
};

module.exports = Module;
