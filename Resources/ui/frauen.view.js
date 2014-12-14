module.exports = function(_parent) {
	var self = Ti.UI.createListView({
		templates : {
			'main' : require('ui/TEMPLATES').main
		},
		caseInsensitiveSearch : true,
		backgroundColor : '#fff',
		defaultItemTemplate : 'main'
	});
	var sections = [];
	self.updateList = function() {
		var pods = require('model/frauen').podcasterinnen;
		var items = [];
		pods.forEach(function(pod) {
			var item = {
				properties : {
					itemId : JSON.stringify({
						url : pod.link,
						description : pod.description,
						title : pod.title,
						logo : pod.logo
					}),
					accessoryType : Titanium.UI.LIST_ACCESSORY_TYPE_DETAIL
				},
				title : {
					text : pod.title
				},
				icon : {
					image : pod.logo
				},
				summary : {
					text : pod.description
				},
				entries : {
					height : 0
				},
				lastitem : {
					height : 0
				}
			};
			if (pod.title && !pod.hidden)
				items.push(item);
		});
		sections.push(Ti.UI.createListSection({
			items : items,
		}));
		self.setSections(sections);
	};
	self.updateList();
	self.addEventListener('itemclick', function(_e) {
		var feed = JSON.parse(_e.itemId);
		var windowmodule = require('ui/rsslist.window');
		var doOpenFeedWindow = function(items) {
			if (items) {
				windowmodule(feed, items).open();
				setTimeout(function() {
					_parent.remove(dialog);
				}, 100);
			} else {
				dialog.list.animate({
					duration : 700,
					transform : Ti.UI.create2DMatrix({
						scale : 0.01,
						rotate : 800
					})
				}, function() {
					_parent.remove(dialog);
				});
				Ti.UI.createNotification({
					message : 'Feed leider nicht auswertbar …'
				}).show();
			}

		};
		var dialog = require('ui/download.widget')(feed, doOpenFeedWindow);
		_parent.add(dialog);

		//
	});

	return self;
};
