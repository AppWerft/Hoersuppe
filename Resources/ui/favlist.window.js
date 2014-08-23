var Moment = require('vendor/moment');
Moment.locale('de');

module.exports = function() {
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	
	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
	});
	self.list = Ti.UI.createListView({
		templates : {
			'main' : require('ui/TEMPLATES').main
		},
		defaultItemTemplate : 'main',
	});
	var sections = [Ti.UI.createListSection({
		headerTitle : null
	})];
	var updateList = function() {
		Ti.UI.createNotification({
			message : 'Teste alle Podcasts auf Aktualität …'
		}).show();
		var getItem = function(fav, index) {
			var item = {
				properties : {
					itemId : JSON.stringify({
						key : fav.key,
						title : fav.title,
						logo : fav.logo
					}),
					accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DETAIL
				},
				summary : {
					height : 0,
					bottom : 0,
					top : 0
				},
				title : {
					text : fav.title
				},
				entries : {
					text : 'Anzahl der Podcasts:'
				},
				lastitem : {
					text : 'frischester Podcast vom: '
				},
				icon : {
					image : fav.logo
				}
			};
			var FeedAdapter = new (require('controls/rss_adapter'))();
			FeedAdapter.addEventListener('getfeed:ready', function(_items) {
				console.log(_items);
				if (_items) {
					item.lastitem.text = 'Letztes: ' + Moment(_items[0].pubDate).format('LL');
					item.entries.text = 'Anzahl: ' + _items.length;
				} else console.log('Error: no item for ' + fav.key);
			});
			FeedAdapter.start(fav.key,true);
			return item;

		};
		var favs = HoerSuppe.getAllFavs(), items = [];
		console.log(favs);
		if (favs)
			for (var i = 0; i < favs.length; i++) {
				favs[i].title && items.push(getItem(favs[i], i));
			}
		sections[0].setItems(items);
		self.list.setSections(sections);
	};
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		var channel = JSON.parse(_e.itemId);
		var windowmodule = require('ui/rsslist.window');
		var doOpenFeedWindow = function(items) {
			if (items) {
				windowmodule(channel, items).open();
				setTimeout(function() {
					self.remove(dialog);
				}, 100);
			}
		};
		var dialog = require('ui/download.widget')(channel, doOpenFeedWindow);
		self.add(dialog);
	});
	self.addEventListener('focus', updateList);
	return self;
};
