var Flip = require('de.manumaticx.androidflip');

module.exports = function(_parent) {
	var self = Ti.UI.createWindow({
		title : 'Hörsuppe',
		backgroundColor : '#aaa',
	});
	self.container = Flip.createFlipView({
	//	backgroundColor : '#fff',
		top : 0,
		bottom : 0,
		orientation : Flip.ORIENTATION_HORIZONTAL,
		overFlipMode : Flip.OVERFLIPMODE_RUBBER_BAND,
		views : [require('ui/hoersuppe.view')(self), require('ui/frauen.view')(self), require('ui/podbe.view')(self)]
	});
	self.add(self.container);
	self.container.peakNext((Ti.App.Properties.getInt('PEAK', 0) < 3) ? true : false);
	self.container.addEventListener('flipped', function(_e) {
		Ti.App.Properties.setInt('PEAK', Ti.App.Properties.getInt('PEAK', 0) + 1);
	});
	if (Ti.Android) {
		/*self.addEventListener("open", function() {
			var activity = self.getActivity();
			if (activity && activity.actionBar) {
				activity.actionBar.setTitle('Hörsuppe');
				activity.actionBar.setSubtitle('deutschsprachige podcasts');
			}
		});*/
		self.container.addEventListener('flipped', function(_e) {
			var ndx = _e.index;
			var titles = ['Hörsuppe', 'FrauenPodcasts', 'PodBe'];
			_parent.activeTab.setTitle(titles[ndx]);
		});
	};
	return self;
};
