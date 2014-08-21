module.exports = function(HoerSuppe) {
	var self = Ti.UI.createTabGroup({
		fullscreen : true,
		exitOnClose : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});

	var tab1 = Ti.UI.createTab({
		window : require('ui/mainlist.window')(HoerSuppe),
		title : 'alle Podcasts'
	});
	var tab2 = Ti.UI.createTab({
		window : require('ui/favlist.window')(HoerSuppe),
		title : 'Merkliste'
	});
	var tab3 = Ti.UI.createTab({
		window : require('ui/offlist.window')(HoerSuppe),
		title : 'Gespeichertes'
	});
	self.addTab(tab1);
	self.addTab(tab2);
	self.addTab(tab3);

	self.addEventListener('open', function() {
		var activity = self.getActivity();
		if (!activity.actionBar) {
			console.log('Warning: no actionbar');
			return;
		}
		activity.actionBar.setTitle('Hörsuppe');
		activity.actionBar.setSubtitle('Deutschsprachige Podcasts');
		activity.onCreateOptionsMenu = function(e) {
			var searchadded = false;
			e.menu.add({
				itemId : '1',
				title : 'Suche',
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				icon : Ti.App.Android.R.drawable.ic_action_search
			}).addEventListener("click", function() {
				console.log('~~~~~~~~~~~~~~~~');
				self.setActiveTab(0);
				var list = tab1.getWindow().list;
				if (list.searchView) {
					console.log('Info: try to hide searchBar');
					list.searchView.setHeight(0);
				} else {
					list.searchView = Ti.UI.Android.createSearchView({
						hintText : "Podcast-Suche",
						height : 50
					});
				}

			});
			e.menu.add({
				itemId : '0',
				title : '  ',
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				icon : Ti.App.Android.R.drawable.ic_action_filter
			}).addEventListener("click", function() {
				self.setActiveTab(0);
				var sections = HoerSuppe.getAllPodcasts();
				var options = [], selected = [];
				sections.forEach(function(section) {
					options.push(section.title);
					if (section.selected)
						selected.push(section.title);
				});

				var picker = require("yy.tidialogs").createMultiPicker({
					title : "Podcastkategoriefilter",
					options : options,
					selected : selected,
					okButtonTitle : "Übernehmen",
					cancelButtonTitle : "Abbruch"
				});
				picker.addEventListener('click', function(e) {
					console.log(e.selections);
					console.log(e.indexes);
					HoerSuppe.setSelectedPodcasts({
						selected : e.selections,
						options : options
					});
					tab1.getWindow().updateList();
				});
				picker.show();
			});

		};
	});
	require('vendor/versionsreminder')();
	return self;
};
// Jan Lorenzen 040 428133 105
