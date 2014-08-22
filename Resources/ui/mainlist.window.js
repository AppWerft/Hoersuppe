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
		self.add(require('ui/download.widget')(JSON.parse(_e.itemId),function(_items){
			require('ui/rsslist.window')(HoerSuppe, _e.itemId).open();
		}));

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
