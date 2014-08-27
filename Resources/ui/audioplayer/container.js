function formatTime(ms) {
	var s = Math.round(ms / 1000);
	var sec = s % 60;
	var min = (s - sec) / 60;
	if (sec < 10) {
		sec = '0' + sec;
	}
	return min + ':' + sec;
}

module.exports = function(item) {
	console.log('Info: Start Audioplayer');
	console.log(item);
	var self = Ti.UI.createView();
	self.add(Ti.UI.createView({
		backgroundColor : '#000',
		opacity : 0.8,
		top : 0
	}));
	self.list = Ti.UI.createView({
		width : 240,
		layout : 'vertical',
		backgroundColor : 'white',
		height : Ti.UI.SIZE,
	});
	self.downloader = new (require('./downloader.widget'))();
	if (!item.islocale)
		self.list.add(self.downloader);
	self.list.add(Ti.UI.createImageView({
		image : item.logo,
		defaultImage : '/assets/default.png',
		width : Ti.UI.FILL,
		height : 240,
		top : 0,
	}));
	self.list.add(Ti.UI.createLabel({
		height : 50,
		width : Ti.UI.FILL,
		left : 5,
		right : 5,
		textAlign : 'left',
		color : '#000',
		top : 0,
		ellipsize : true,
		text : item.title
	}));
	self.player = Ti.Media.createVideoPlayer({
		height : 20,
		allowsAirPlay : true,
		autoplay : false,
		scalingMode : Ti.Media.VIDEO_SCALING_ASPECT_FIT,
		mediaControlStyle : Ti.Media.VIDEO_CONTROL_NONE,
		url : item.url
	});
	self.playercontrolview = Ti.UI.createView({
		top : 0,
		height : 100,
		backgroundColor : '#224929'
	});
	//self.list.add(self.player);
	self.slider = Ti.UI.createSlider({
		bottom : 7,
		min : 0,
		max : 1,
		value : 0.01,
		width : '70%',
		height : 30
	});
	self.currenttime = Ti.UI.createLabel({
		left : 5,
		font : {
			fontSize : 10
		},
		text : '00:00',
		bottom : 10,
		color : 'white'
	});
	self.endtime = Ti.UI.createLabel({
		right : 5,
		font : {
			fontSize : 10
		},
		bottom : 10,
		text : '00:00',
		color : 'white'
	});
	var cron = null;
	var duration = null;
	self.player.addEventListener('durationavailable', function(_e) {
		duration = _e.source.duration;
		console.log('Info: starting Playing of ' + formatTime(duration));
		cron = setInterval(function() {
			var ratio = _e.source.currentPlaybackTime / duration;
			if (!seeking)
				self.slider.setValue(ratio);
			self.currenttime.setText(formatTime(_e.source.currentPlaybackTime));
			self.endtime.setText(formatTime(_e.source.duration));

		}, 1000);

	});
	var seeking = false;
	self.slider.addEventListener('start', function() {
		seeking = true;
	});
	self.slider.addEventListener('stop', function(_evt) {
		duration * _evt.value;
		seeking = false;
	});
	self.slider.show();

	self.pause = Ti.UI.createButton({
		top : 5,
		left : 50,
		backgroundImage : '/assets/pause.png',
		width : 50,
		height : 50,
		opacity : 0.3
	});
	self.play = Ti.UI.createButton({
		top : 5,
		backgroundImage : '/assets/play.png',
		width : 50,
		left : 110,
		height : 50
	});
	self.stop = Ti.UI.createButton({
		top : 5,
		backgroundImage : '/assets/stop.png',
		width : 50,
		left : 170,
		opacity : 0.3,
		height : 50
	});
	self.playercontrolview.add(self.pause);
	self.playercontrolview.add(self.play);
	self.playercontrolview.add(self.stop);

	self.playercontrolview.add(self.slider);
	self.playercontrolview.add(self.currenttime);
	self.playercontrolview.add(self.endtime);

	self.add(self.player);
	self.list.add(self.playercontrolview);
	self.add(self.list);
	self.player.play();
	if (!item.islocal)
		Ti.UI.createNotification({
			message : 'Zum Runderladen des Podcasts einfach nach unten ziehen …'
		}).show();
	self.list.addEventListener('swipe', function(_e) {
		/*if (_e.direction == 'down') {
			var y = self.getRect().y;
			self.list.animate({
				top : y + 50,
				duration : 700
			}, function() {
				self.list.animate({
					top : y
				});
			});
			self.downloader.startDownload();
		}*/
	});
	self.player.addEventListener('playbackstate', function(_evt) {
		switch (_evt.playbackState) {
		case Ti.Media.VIDEO_PLAYBACK_STATE_INTERRUPTED:
			break;
		case Ti.Media.VIDEO_PLAYBACK_STATE_PAUSED:
			self.play.setOpacity(1);
			self.pause.setOpacity(0.3);
			self.stop.setOpacity(1);
			break;
		case Ti.Media.VIDEO_PLAYBACK_STATE_PLAYING:
			self.play.setOpacity(0.3);
			self.pause.setOpacity(1);
			self.stop.setOpacity(1);
			break;
		case Ti.Media.VIDEO_PLAYBACK_STATE_SEEKING_BACKWARD:
			break;
		case Ti.Media.VIDEO_PLAYBACK_STATE_SEEKING_FORWARD:
			break;
		case Ti.Media.VIDEO_PLAYBACK_STATE_STOPPED:
			self.stop.setOpacity(0.3);
			break;
		}
	});
	self.play.addEventListener('click', function() {
		self.play.setOpacity(0.3);
		self.player.play();
	});
	self.pause.addEventListener('click', function() {
		self.player.pause();
	});
	self.stop.addEventListener('click', function() {
		self.player.stop();
	});
	return self;
};
