function formatTime(ms) {
	var s = Math.round(ms / 1000);
	var sec = s % 60;
	var min = (s - sec) / 60;
	if (sec < 10) {
		sec = '0' + sec;
	}
	return min + ':' + sec;
}

exports.getduration = function(_url, _ondurationavailable) {
	var timer = setTimeout(function() {
		_ondurationavailable({
			success : false
		});
	}, 11000);
	var self = Ti.Media.createVideoPlayer({
		height : 20,
		width : 42,
		url : _url
	});
	console.log('URL='+_url);
	self.addEventListener('durationavailable', function(_e) {
		var duration = _e.source.duration;
		clearTimeout(timer);
		_ondurationavailable({
			duration : duration,
			success : true
		});

	});
	return self;
};
