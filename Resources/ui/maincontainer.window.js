var Flip = require('de.manumaticx.androidflip');

module.exports = function(_parent) {
	var self = Ti.UI.createWindow({
		backgroundColor : '#888',
	});
	self.container = Flip.createFlipView({
		orientation : Flip.ORIENTATION_HORIZONTAL,
		overFlipMode : Flip.OVERFLIPMODE_GLOW,
		views : [require('ui/hoersuppe.view')(self), require('ui/frauen.view')(self), require('ui/podbe.view')(self)]
	});
	self.add(self.container);
	self.container.peakNext((Ti.App.Properties.getInt('PEAK', 0) < 3) ? true : false);
	self.container.addEventListener('flipped', function(_e) {
		Ti.App.Properties.setInt('PEAK', Ti.App.Properties.getInt('PEAK', 0) + 1);
	});
	Ti.Android && self.container.addEventListener('flipped', function(_e) {
		var ndx = _e.index;
		var titles = ['Hörsuppe', 'FrauenPodcasts', 'PodBe'];
		_parent.activeTab.setTitle(titles[ndx]);
	});
	return self;
};
