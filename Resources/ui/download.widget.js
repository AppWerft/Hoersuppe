module.exports = function(_feed, _callback) {
	var getStrip = function(_eventname) {
		this.view = Ti.UI.createView({
			top : 0,
			height : Ti.UI.SIZE,
			width : '90%'
		});
		this.spinner = Ti.UI.createActivityIndicator({
			top : 10,
			left : 0
		});
		this.view.add(this.spinner);
		this.label = Ti.UI.createLabel({
			top : 10,
			left : 0,
			width : Ti.UI.FILL,height:20,
			textAlign : 'left',
			font : {
				fontSize : 12
			}
		});
		this.view.add(this.label);
		this.bar = Ti.UI.createProgressBar({
			top : 10,
			height : 30,
			width : Ti.UI.FILL,
			min : 0,
			value : 0,
			bottom : 5,
			max : 1
		});
		this.view.add(this.bar);
		this.bar.show();
		var that = this;
		FeedAdapter.addEventListener(_eventname + ':start', function(_e) {
			that.label.setLeft(20);
			if (_e && _e.message)
				that.label.setText(_e.message);
			that.spinner.show();
		});
		FeedAdapter.addEventListener(_eventname + ':progress', function(_e) {
			if (_e && _e.message)
				that.label.setText(_e.message);
			that.label.setLeft(20);
			that.bar.setValue(_e.value);
		});
		FeedAdapter.addEventListener(_eventname + ':ready', function(_e) {
			that.label.setLeft(0);
			if (_e && _e.message)
				that.label.setText(_e.message);
			that.bar.setValue(1);
			that.spinner.hide();
		});
		return this.view;
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
	var FeedAdapter = new (require('controls/rss_adapter'))(_feed);
	self.list.add(new getStrip('geturl'));
	self.list.add(new getStrip('getfeed'));
	self.add(self.list);
	FeedAdapter.addEventListener('getfeed:ready', function(_e) {
		if (_e.result) {
			_callback(_e.result);
		}
	});
	FeedAdapter.addEventListener('error', function(_e) {
			_callback(null);
	});
	FeedAdapter.start(_feed);
	return self;
};
