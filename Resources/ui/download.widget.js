module.exports = function(_feed) {
	var getStrip = function(_eventname) {
		var view = Ti.UI.createView({
			top : 0,
			height : Ti.UI.SIZE,
			width : '90%'
		});
		var spinner = Ti.UI.createActivityIndicator({
			top : 10,
			left : 0
		});
		view.add(spinner);
		label = Ti.UI.createLabel({
			top : 10,
			left : 0,
			width : Ti.UI.FILL,
			textAlign : 'left',
			font : {
				fontSize : 12
			}
		});
		view.add(label);
		var bar = Ti.UI.createProgressBar({
			top : 10,
			height : 30,
			width : Ti.UI.FILL,
			min : 0,
			value : 0,
			bottom : 5,
			max : 1
		});
		view.add(bar);
		RSSADAPTER.addEventListener(_eventname + ':start', function(_e) {
			bar.show();
			console.log('Info: ' + _eventname + ':start received ' + _e.value);
			label.setLeft(20);
			if (_e && _e.message)
				label.setText(_e.message);
			spinner.show();
		});
		RSSADAPTER.addEventListener(_eventname + ':progress', function(_e) {
			console.log('Info: ' + _eventname + ':progress ' + _e.value);
			if (_e && _e.message)
				label.setText(_e.message);
			label.setLeft(20);
			bar.setValue(_e.value);
		});
		RSSADAPTER.addEventListener(_eventname + ':ready', function(_e) {
			label.setLeft(0);
			console.log('Info: ' + _eventname + ':ready received');
			if (_e && _e.message)
				label.setText(_e.message);
			bar.setValue(1);
			spinner.hide();
		});
		return view;

		return view;
	};
	/* START */
	var self = Ti.UI.createView();
	self.add(Ti.UI.createView({
		backgroundColor : '#000',
		opacity : 0.8,
		top : 0
	}));
	self.list = Ti.UI.createView({
		layout : 'vertical',
		width : 240,
		backgroundColor : 'white',
		height : Ti.UI.SIZE
	});
	self.list.add(Ti.UI.createImageView({
		image : _feed.logo,
		defaultImage : '/assets/default.png',
		width : Ti.UI.FILL,
		height : 240,
		top : 0,
		bottom : 20
	}));
	var RSSADAPTER = new (require('controls/rss_adapter'))();
	self.list.add(getStrip('geturl'));
	self.list.add(getStrip('getfeed'));
	RSSADAPTER.start(_feed.key);
	self.add(self.list);
	return self;
};
