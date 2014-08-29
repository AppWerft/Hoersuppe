const OPAQUE = 0.3;
module.exports = function(item) {

	/*var dummy = Ti.UI.createImageView({
	 image : parent.toImage()
	 });
	 bgfile.write(dummy.toBlob());
	 var imgblurredImage = require('bencoding.blur').applyBlurTo({
	 image : bgfile.nativePath,
	 blurRadius : 10
	 });
	 */
	var duration = 0;
	var self = Ti.UI.createWindow({
		fullscreen : true,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});
	var bg = Ti.UI.createImageView({
		top : -100,
		image : Ti.Filesystem.getFile(Ti.App.Properties.getString('BG')).read()
	});
	self.add(bg);

	/* we need this dummy to determine duration, audioplayer doesn't give us this detail */
	var dummyplayer = require('controls/mediaplayer').getduration(item.url, function(_res) {
		duration = parseInt(_res.duration);
		self.endtime.setText(formatTime(_res.duration));
		// kann wech!
		self.remove(dummyplayer);
		dummyplayer = null;
		self.playbutton.setOpacity(1);
		self.playbutton.touchEnabled = true;
		self.slider.show();
		self.spinner.hide();

	});

	self.add(dummyplayer);
	//videolayer only works after adding
	self.add(Ti.UI.createView({
		backgroundColor : '#000',
		opacity : 0.77,
	}));
	self.container = Ti.UI.createView({
		width : 240,
		layout : 'vertical',
		backgroundColor : 'white',
		height : Ti.UI.SIZE,
	});
	self.downloader = new (require('./downloader.widget'))();
	if (!item.islocal) {
		self.container.add(self.downloader.createView(item));
		console.log('Info: downloader added');
	}
	self.container.add(Ti.UI.createImageView({
		image : item.logo,
		defaultImage : '/assets/default.png',
		width : Ti.UI.FILL,
		height : 240,
		top : 0,
	}));
	/*
	 self.container.add(Ti.UI.createLabel({
	 height : 50,
	 width : Ti.UI.FILL,
	 left : 5,
	 right : 5,
	 textAlign : 'left',
	 color : '#000',
	 top : 0,
	 ellipsize : true,
	 text : item.title
	 }));*/
	Ti.App.AudioPlayer = Ti.Media.createAudioPlayer({
		allowBackground : true,
		autoplay : false,
		url : item.url,
		volume : 1
	});
	Ti.App.AudioPlayercontrolview = Ti.UI.createView({
		top : 0,
		height : 110,
		backgroundColor : '#224929'
	});
	self.slider = Ti.UI.createSlider({
		bottom : 0,
		min : 0,
		max : 1,
		value : 0.01,
		width : '70%',
		height : 36
	});
	self.currenttime = Ti.UI.createLabel({
		left : 5,
		font : {
			fontSize : 10
		},
		text : '',
		bottom : 10,
		color : 'white'
	});
	self.endtime = Ti.UI.createLabel({
		right : 5,
		font : {
			fontSize : 10
		},
		bottom : 10,
		text : '',
		color : 'white'
	});
	Ti.App.AudioPlayer.addEventListener('progress', function(_e) {
		if (duration) {
			var ratio = _e.progress / duration;
			if (!seeking)
				self.slider.setValue(ratio);
			self.currenttime.setText(formatTime(_e.progress));
		}
	});
	var seeking = false;
	self.slider.addEventListener('start', function() {
		Ti.App.AudioPlayer.pause();
		seeking = true;
	});
	self.slider.addEventListener('stop', function(_evt) {
		var position = parseFloat(_evt.value);
		Ti.App.AudioPlayer.setTime(duration * _evt.value);
		seeking = false;
		Ti.App.AudioPlayer.play();
	});
	self.pausebutton = Ti.UI.createButton({
		top : 5,
		left : 30,
		backgroundImage : '/assets/pause.png',
		width : 50,
		height : 50,
		opacity : OPAQUE
	});
	self.playbutton = Ti.UI.createButton({
		top : 5,
		backgroundImage : '/assets/play.png',
		width : 50,
		touchEnabled : false,
		opacity : OPAQUE,
		left : 90,
		height : 50
	});
	self.spinner = Ti.UI.createActivityIndicator({
		top : 20,
		left : 105,
		style : Ti.UI.ActivityIndicatorStyle.PLAIN
	});

	self.stopbutton = Ti.UI.createButton({
		top : 5,
		touchEnabled : false,
		backgroundImage : '/assets/stop.png',
		width : 50,
		left : 150,
		opacity : OPAQUE,
		height : 50
	});
	Ti.App.AudioPlayercontrolview.add(self.pausebutton);
	Ti.App.AudioPlayercontrolview.add(self.playbutton);
	Ti.App.AudioPlayercontrolview.add(self.spinner);
	self.spinner.show();
	Ti.App.AudioPlayercontrolview.add(self.stopbutton);
	Ti.App.AudioPlayercontrolview.add(self.slider);
	Ti.App.AudioPlayercontrolview.add(self.currenttime);
	Ti.App.AudioPlayercontrolview.add(self.endtime);
	self.container.add(Ti.App.AudioPlayercontrolview);
	self.add(self.container);
	self.container.addEventListener('swipe', function(_e) {
		if (_e.direction == 'down' && !self.downloader.locked) {
			var y = self.container.getRect().y;
			self.container.animate({
				top : y + 20,
				duration : 100
			}, function() {
				self.container.animate({
					top : y
				});
			});
			self.downloader.startDownload();
		}
	});
	Ti.App.AudioPlayer.addEventListener('complete', function(_evt) {
		self.stopbutton.setOpacity(OPAQUE);
		self.playbutton.setOpacity(1);
	});
	Ti.App.AudioPlayer.addEventListener('change', function(_evt) {
		Ti.API.info('State: ' + _evt.description + ' (' + _evt.state + ')');
		switch (_evt.description) {
		case  'starting':
			self.playbutton.touchEnabled = false;
			break;
		case 'playing' :
			self.playbutton.touchEnabled = false;
			self.playbutton.setOpacity(OPAQUE);
			self.pausebutton.setOpacity(1);
			self.stopbutton.setOpacity(1);
			break;
		case 'paused':
			self.playbutton.touchEnabled = true;
			self.pausebutton.touchEnabled = false;
			self.playbutton.setOpacity(1);
			self.pausebutton.setOpacity(OPAQUE);
			self.stopbutton.setOpacity(1);
			break;
		case 'stopped':
			self.stopbutton.setOpacity(OPAQUE);
			self.playbutton.setOpacity(1);
			break;
		}
	});
	self.playbutton.addEventListener('click', function() {
		Ti.App.AudioPlayer.play();
		self.playbutton.setOpacity(OPAQUE);
	});
	self.pausebutton.addEventListener('click', function() {
		console.log('Info: PAUSE');
		Ti.App.AudioPlayer.pause();
	});
	self.stopbutton.addEventListener('click', function() {
		console.log('Info: STOP');
		Ti.App.AudioPlayer.stop();
	});
	self.addEventListener('open', function() {
		var activity = self.getActivity();
		if (!activity.actionBar) {
			console.log('Warning: no actionbar');
			return;
		}
		activity.actionBar.setTitle((item.feedname) ? item.feedname : '');
		activity.actionBar.setSubtitle(item.title);
	});

	self.open({
		animated : false
	});
	self.addEventListener('androidback', function() {
		Ti.App.AudioPlayer.stop();
		Ti.App.AudioPlayer.release();
		self.close();
		return true;
	});

};

function formatTime(ms) {
	var s = Math.round(ms / 1000), sec = s % 60, min = (s - sec) / 60;
	if (sec < 10) {
		sec = '0' + sec;
	}
	return min + ':' + sec;
}