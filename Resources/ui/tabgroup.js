	module.exports = function() {
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();

	var self = Ti.UI.createTabGroup({
		fullscreen : true,
		exitOnClose : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});
	var tab1 = Ti.UI.createTab({
		window : require('ui/maincontainer.window')(self),
		title : 'Hörsuppe'
	});
	var tab3 = Ti.UI.createTab({
		window : require('ui/favlist.window')(self),
		title : 'Merkliste'
	});
	var tab4 = Ti.UI.createTab({
		window : require('ui/offlist.window')(self),
		title : 'Gespeichertes'
	});
	self.addTab(tab1);
	
	self.addTab(tab3);
	self.addTab(tab4);
	self.addEventListener('open', function() {
		var activity = self.getActivity();
		if (!activity.actionBar) {
			console.log('Warning: no actionbar');
			return;
		}
		activity.actionBar.setTitle('HinHörer');
		activity.actionBar.setSubtitle('Deutschsprachige Podcasts');
		activity.onCreateOptionsMenu = function(e) {
			e.menu.clear();
			e.activity = activity;
			e.actionBar = activity.actionBar;
			self.activeTab && self.activeTab.fireEvent('onCreateOptionsMenu', e);
			var searchvisible = false;
			e.menu.add({
				itemId : '1',
				title : 'Suche',
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				icon : Ti.App.Android.R.drawable.ic_action_search
			}).addEventListener("click", function() {
				self.setActiveTab(0);
				var list = tab1.getWindow().container.views[0];
				tab1.getWindow().container.flipToView(0);
				return;
				if (searchvisible == true) {
					list.searchView.blur();
					list.searchView.setTop('-45');
				} else {
					list.searchView = Ti.UI.createSearchBar({
						hintText : "Podcast-Suche",
						softKeyboardOnFocus : Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS,
						height : 45,
						top : 0,
						submitEnabled : false
					});
					//list.searchView.focus();
					searchvisible = true;
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
					tab1.getWindow().container.views[0].updateList();
				});
				picker.show();
			});

		};
		activity.invalidateOptionsMenu();
	});
	require('vendor/versionsreminder')();
	return self;
};
// Jan Lorenzen 040 428133 105
