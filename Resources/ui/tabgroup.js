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
		var Dialogs = require("yy.tidialogs");
		var activity = self.getActivity();
		if (!activity.actionBar) {
			console.log('Warning: no actionbar');
			return;
		}
		//var abx = require('com.alcoapps.actionbarextras');
		//abx.setTitleFont('Sprint');
		activity.actionBar.setTitle('Hörsuppe');
		activity.actionBar.setSubtitle('deutsche podcasts');
		activity.onCreateOptionsMenu = function(e) {
			e.menu.add({
				itemId : '0',
				title : '  ',
				showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
				icon : Ti.App.Android.R.drawable.ic_action_view_as_list
			}).addEventListener("click", function() {
				var picker = Dialogs.createMultiPicker({
					title : "Podcastkategoriefilter",
					options : ["Genießen", "Geschichten", "Gesellschaft", "Interview", "Kultur", "Lernen", "Medien", "Podcasting", "Spiele", "Sport", "Technik", "Wissenschaft", " … unsortiert"],
					selected : ["B", "C"], // <-- optional
					okButtonTitle : "Übernehmen", // <-- optional
					cancelButtonTitle : "Abbruch" // <-- optional
				});
				picker.addEventListener('click', function(e) {
					var indexes = e.indexes;
					console.log(indexes);
					// selected indexes
					var selections = e.selections;
					console.log(selections);
					// the actual selected options.
				});
				picker.show();
			});

		};
	});
	require('vendor/versionsreminder')();
	return self;
};
// Jan Lorenzen 040 428133 105