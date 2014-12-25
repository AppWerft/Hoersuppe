module.exports = function() {
	var Model = new (require('controls/hoersuppe_adapter'))();
	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
	});
	self.list = Ti.UI.createListView({
		templates : {
			'fav' : require('ui/TEMPLATES').fav
		},
		defaultItemTemplate : 'fav',
	});
	var sections = [Ti.UI.createListSection({
		headerTitle : null
	})];
	var updateList = function() {
		
		Ti.UI.createNotification({
			message : 'Teste alle Podcasts auf Aktualität …'
		}).show();
		var favs = Model.getAllFavs(), items = [];
		if (favs) {
			var i=0;
			favs.forEach(function(fav) {
				items.push(new (require('ui/listitem.widget'))(fav, sections[0], i++));
				//items.push(getItem(favs[i],sections[0], i));
			});
		}
		sections[0].setItems(items);
		self.list.setSections(sections);
	};
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		var feed = JSON.parse(_e.itemId);
		var windowmodule = require('ui/rsslist.window');
		var doOpenFeedWindow = function(items) {
			if (items) {
				windowmodule(feed, items).open();
				setTimeout(function() {
					self.remove(dialog);
				}, 100);
			}
		};
		var dialog = require('ui/download.widget')(feed, doOpenFeedWindow);
		self.add(dialog);
	});
	self.addEventListener('open', function() {
		updateList();
		var activity = self.getActivity();
		if (!activity.actionBar) {
			console.log('Warning: no actionbar');
			return;
		}
		activity.onCreateOptionsMenu = function(e) {
			console.log('ZWEITES TAB');
		};
	});	
	return self;
};
