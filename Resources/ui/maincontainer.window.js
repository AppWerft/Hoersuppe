var Flip = require('de.manumaticx.androidflip');

module.exports = function(_parent) {
	var self = Ti.UI.createWindow({
		title : 'Hörsuppe',
		backgroundColor : '#fff',
		fullscreen : true,
		exitOnClose : true

	});
	self.container = Flip.createFlipView({
		backgroundColor : '#fff',
		orientation : Flip.ORIENTATION_HORIZONTAL,
		overFlipMode : Flip.OVERFLIPMODE_RUBBER_BAND,
		views : [require('ui/hoersuppe.view')(self), require('ui/frauen.view')(self), require('ui/podbe.view')(self)]
	});
	self.add(self.container);
	self.container.peakNext();
	self.container.addEventListener('flipped', function(_e) {
	});
	if (Ti.Android) {
		self.addEventListener("open", function() {
			var activity = self.getActivity();
			if (activity && activity.actionBar) {
				activity.actionBar.setTitle('Hörsuppe');
				activity.actionBar.setSubtitle('deutschsprachige podcasts');
			}
		});
		self.container.addEventListener('scrollend', function(_e) {
			var ndx = _e.currentPage;
			var titles = ['Hörsuppe', 'Frauen', 'PodBe'];
			_parent.activeTab.setTitle(titles[ndx]);
		});
	};
	return self;
};
