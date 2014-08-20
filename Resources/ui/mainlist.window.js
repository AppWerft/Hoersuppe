module.exports = function(HoerSuppe) {
	var self = Ti.UI.createWindow({
		title : 'Hörsuppe',
		backgroundColor : '#fff',
		fullscreen : true,
		exitOnClose : true

	});
	self.list = Ti.UI.createListView({
		templates : {
			'main' : require('ui/TEMPLATES').main
		},
		defaultItemTemplate : 'main',
	});
	console.log(HoerSuppe);
	console.log(HoerSuppe.getAllPodcasts());
	var cats = require('model/podcasts');
	var sections = [];
	for (var i = 0; i < cats.ul.li.length; i++) {
		var headerview = Ti.UI.createView({
			height : 30,
			backgroundColor : '#444'
		});
		headerview.add(Ti.UI.createLabel({
			text : '  ' + cats.ul.li[i].a.content,
			textAlign : 'left',
			width : Ti.UI.FILL,
			color : 'white',
			font : {
				fontSize : 16,
				fontFamily : 'Sprint'
			}
		}));
		sections.push(Ti.UI.createListSection({
			headerView : headerview
		}));
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
				properties : {
					itemId : JSON.stringify({
						key : key,
						title : cats.a[i].content,
						logo : 'http://hoersuppe.de/feature/cache/' + key + '.jpg'
					}),
					accessoryType : Titanium.UI.LIST_ACCESSORY_TYPE_DETAIL
				},
				title : {
					text : cats.a[i].content
				},
				icon : {
					image : 'http://hoersuppe.de/feature/cache/' + key + '.jpg'
				}
			});
		}
	}
	for (var i = 0; i < items.length; i++) {
		sections[i].setItems(items[i]);
	}
	self.list.setSections(sections);
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		require('ui/rsslist.window')(_e.itemId).open();
	});
	if (Ti.Android) {
		self.addEventListener("open", function() {
			var activity = self.getActivity();
			if (activity && activity.actionBar) {
				activity.actionBar.setTitle('Hörsuppe');
				activity.actionBar.setSubtitle('deutschsprachige podcasts');
			}
		});
	};
	return self;
};
