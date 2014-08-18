var HoerSuppe = require('controls/hoersuppe_adapter');

module.exports = function(options) {
	console.log(options);
	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
		bottom : 0,
		height : 300
	});
	self.add(Ti.UI.createImageView({
		top : 0,
		width : Ti.UI.FILL,
		image : options.logo
	}));
	if (Ti.Android) {
		self.addEventListener("open", function() {
			var activity = self.getActivity();
			if (activity && activity.actionBar) {
				actionbar = activity.actionBar;
				actionbar.setDisplayHomeAsUp(true);
				actionbar.setTitle(options.title);
				actionbar.onHomeIconItemSelected = function() {
					self.close();
				};
				activity.onCreateOptionsMenu = function(e) {
					e.menu.add({
						title : 'Bestellen',
						itemId : '0',
						showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
						icon : Ti.App.Android.R.drawable.ic_action_favorite
					}).addEventListener("click", function() {

					});
				};
			}
		});
	};
	return self;
};
