module.exports = function() {
	var self = Ti.UI.createTabGroup({
		fullscreen : true,
		exitOnClose : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});
	var tab1 = Ti.UI.createTab({
		window : require('ui/mainlist.window')(),
		title : 'alle Podcasts'
	});
	var tab2 = Ti.UI.createTab({
		window : require('ui/favlist.window')(),
		title : 'Merkliste'
	});
	var tab3 = Ti.UI.createTab({
		window : require('ui/offlist.window')(),
		title : 'Gespeichertes'
	});
	self.addTab(tab1);
	self.addTab(tab2);self.addTab(tab3);

	self.addEventListener('open', function() {
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

		};
	});
	require('vendor/versionsreminder')();
	return self;
};
// Jan Lorenzen 040 428133 105