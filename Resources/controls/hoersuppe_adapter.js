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
	getAllPodcasts : function() {
		var cats = require('model/podcasts');
		var sections = [];
		for (var i = 0; i < cats.ul.li.length; i++) {
			sections.push({
				key : cats.ul.li[i].a.href.replace('#mz_', ''),
				title : cats.ul.li[i].a.content
			});
		}
		var sectionndx = -1;
		var items = [];
		for (var i = 0; i < cats.a.length; i++) {
			if (cats.a[i].id) {
				sectionndx++;
				items[sectionndx] = [];
				continue;
			}
			if (cats.a[i].content) {
				var key = cats.a[i].href.substr(9);
				items[sectionndx].push({
					key : key,
					title : cats.a[i].content,
					logo : 'http://hoersuppe.de/feature/cache/' + key + '.jpg'
				});
			}
		}
		for (var i = 0; i < items.length; i++) {
			sections[i].setItems(items[i]);
		}
		return sections;

	},
	getAllAudioFiles : function() {
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
