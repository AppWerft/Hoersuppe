/* helper function to detect save place */
function getFilehandle(file) {
	return (Ti.Filesystem.isExternalStoragePresent() ) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, file) : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, filename + '.meta');
}

/* Constructor */
var HoersuppenModule = function() {
	this.eventhandlers = [];
	return this;
};

/* prototyped methods */
HoersuppenModule.prototype = {
	getAllFavs : function() {
		if (Ti.App.Properties.hasProperty('myfavs')) {
			var favs = Ti.App.Properties.getList('myfavs');
		} else
			favs = [];
		return favs;
	},
	addFav : function(fav) {
		var favs = this.getAllFavs();
		favs.unshift(fav);
		Ti.App.Properties.setList('myfavs', favs);
	},
	removeFav : function(delfav) {
		var oldfavs = this.getAllFavs();
		var newfavs = [];
		oldfavs.forEach(function(thisfav) {
			if (delfav.key != thisfav.key)
				newfavs.push(thisfav);
		});
		oldfavs = null;
		Ti.App.Properties.setList('myfavs', newfavs);
	},
	isFav : function(fav) {
		var favs = this.getAllFavs();
		var found = false;
		favs.forEach(function(f) {
			if (fav.key == f.key)
				found = true;
		});
		return found;

	},
	setSelectedPodcasts : function(_res) {
		if (_res)
			Ti.App.Properties.setList('LIST_OFSELECTEDPODCASTCATEGORIES', _res.selected);
	},
	getAllPodcasts : function() {
		var sections = [];
		var selects = Ti.App.Properties.getList('LIST_OFSELECTEDPODCASTCATEGORIES');
		var cats = require('model/hoersuppe');
		cats.ul.li.forEach(function(cat) {
			var selected = (selects == null || selects == [] || selects.indexOf(cat.a.content) != -1)//
			? true : false;
			sections.push({
				key : cat.a.href.split('_')[1],
				title : cat.a.content,
				selected : selected,
				podcasts : []
			});
		});
		var sectionndx = -1;
		var items = [];
		cats.a.forEach(function(cat) {
			if (cat.id) {
				sectionndx++;
				items[sectionndx] = [];
			} else if (cat.content) {
				var key = (cat.href || !cat.url) ? cat.href.substr(9) : null;
				sections[sectionndx].podcasts.push({
					key : key || cat.url,
					title : cat.content,
					summary : cat.summary,
					url : (cat.url) ? cat.url : null,
					logo : (cat.logo) ? cat.logo : 'http://hoersuppe.de/feature/cache/' + key + '.jpg'
				});
			}
		});
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
	getPath : function(url) {
		var file = getFilehandle(Ti.Utils.md5HexDigest(url));
		return (file.exists()) ? {
			path : file.nativePath,
			local : true,
		} : {
			path : url,
			local : false
		};
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

module.exports = HoersuppenModule;
