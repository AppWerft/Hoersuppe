module.exports = function(HoerSuppe) {
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
		var favs = HoerSuppe.getAllFavs(), items = [];
		if (!favs) return;
		for (var i = 0; i < favs.length; i++) {
			var fav = favs[i];
			items.push({
				properties : {
					itemId : JSON.stringify({
						key : fav.key,
						title : fav.title,
						logo : fav.logo
					}),
					accessoryType : Titanium.UI.LIST_ACCESSORY_TYPE_DETAIL
				},
				title : {
					text : fav.title
				},
				icon : {
					image : fav.logo
				}
			});
		}
		sections[0].setItems(items);
		self.list.setSections(sections);
	};
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		require('ui/rsslist.window')(HoerSuppe,_e.itemId).open();
	});
	self.addEventListener('focus', updateList);
	return self;
};
