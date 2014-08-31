module.exports = function(_parent) {
	var self = Ti.UI.createWindow({
		title : 'Hörsuppe',
		backgroundColor : '#fff',
		fullscreen : true,
		exitOnClose : true

	});
	self.container = Ti.UI.createScrollableView({
		showPagingControl : true,
		views : [require('ui/hoersuppe.view')(self), require('ui/podlove.view')(self)]

	});
	self.add(self.container);
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
			var titles = ['Hörsuppe','PodLove'];
			_parent.activeTab.setTitle(titles[ndx]);
		});
	};
	return self;
};
