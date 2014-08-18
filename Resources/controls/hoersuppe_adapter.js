var DB = Ti.Database.install('/models/hoersuppe.sqlite', 'hoersuppe');
DB.close();

var Hoersuppe = {
	save : function(item, callback) {
		var filename = Ti.Utils.md5HexDigest(item.url);
		var audiofile = (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, filename) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		var metafile = (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, filename + '.meta') : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + '.meta');

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
				Ti.App.fireEvent('app:downloadprogress:'+filename, {
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
		var folder = (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);
		var dir_files = folder.getDirectoryListing();
		var metalist = [];
		for (var i = 1; i < dir_files.length; i++) {
			if (!dir_files[i].match(/\.meta$/))
				continue;
			mp3name = dir_files[i].replace('.meta', '');
			var meta = (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, dir_files[i]) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, dir_files[i]);
			var mp3 = (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, mp3name) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, mp3name);
			if (mp3.exists()) {
				var item = JSON.parse(meta.read().text);
				item.url = mp3.nativePath;
				metalist.unshift(item);
			}

		}
		return metalist;
	},
	isSaved : function(url) {
		var filename = Ti.Utils.md5HexDigest(url);
		var file = (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, filename) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename);
		return file.exist();
	}
};
module.exports = Hoersuppe;
