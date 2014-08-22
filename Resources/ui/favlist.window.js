var Moment = require('vendor/moment');
Moment.locale('de');
module.exports = function() {
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
	});
	console.log('favlist ' + HoerSuppe.toType());
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
		var favs = HoerSuppe.getAllFavs(), items = [];
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
			var RSSADAPTER = new (require('controls/rss_adapter'))(fav.key);
			RSSADAPTER.addEventListener('load', function(_items) {
				if (_items) {
					item.lastitem.text = 'Letztes: ' + Moment(_items[0].pubDate).format('LL');
					item.entries.text = 'Anzahl: ' + _items.length;
				}
			});
			return item;

		};
		if (favs)
			for (var i = 0; i < favs.length; i++) {
				items.push(getItem(favs[i], i));
			}
		sections[0].setItems(items);
		self.list.setSections(sections);
	};
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		require('ui/rsslist.window')(HoerSuppe, _e.itemId).open();
	});
	self.addEventListener('focus', updateList);
	return self;
};
