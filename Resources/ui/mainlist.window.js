module.exports = function() {
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	console.log('mainlist ' + HoerSuppe.toType());

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
		caseInsensitiveSearch : true,
		defaultItemTemplate : 'main'
	});
	self.updateList = function() {
		var podcasts = HoerSuppe.getAllPodcasts();
		var sections = [];
		podcasts.forEach(function(section) {
			var headerview = Ti.UI.createView({
				height : 30,
				backgroundColor : '#444'
			});
			headerview.add(Ti.UI.createLabel({
				text : '  ' + section.title,
				textAlign : 'left',
				width : Ti.UI.FILL,
				color : 'white',
				font : {
					fontSize : 16,
					fontFamily : 'Sprint'
				}
			}));
			var items = [];
			section.podcasts.forEach(function(pod) {
				var key = pod.key;
				items.push({
					properties : {
						itemId : JSON.stringify({
							key : pod.key,
							title : pod.title,
							logo : pod.logo
						}),
						searchableText : pod.summary + ' ' + pod.title,
						accessoryType : Titanium.UI.LIST_ACCESSORY_TYPE_DETAIL
					},
					title : {
						text : pod.title
					},
					icon : {
						image : pod.logo
					},
					summary : {
						text : pod.summary
					},
					entries : {
						height : 0
					},
					lastitem : {
						height : 0
					}
				});
			});
			if (section.selected)
				sections.push(Ti.UI.createListSection({
					items : items,
					headerView : headerview
				}));
		});
		self.list.setSections(sections);
	};

	self.updateList();
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
			} else {
				dialog.list.animate({
					duration : 700,
					transform : Ti.UI.create2DMatrix({
						scale : 0.01,
						rotate : 800
					})
				}, function() {
					self.remove(dialog);
				});
				Ti.UI.createNotification({
					message : 'Feed leider nicht auswertbar …'
				}).show();
			}

		};
		var dialog = require('ui/download.widget')(channel, doOpenFeedWindow);
		self.add(dialog);

		//
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
