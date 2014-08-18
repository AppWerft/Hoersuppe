! function() {
	Ti.App.AudioPlayer = Ti.Media.createAudioPlayer({
		allowBackground : true
	});
	var HoerSuppe = require('controls/hoersuppe_adapter');
	require('ui/tabgroup')().open();
}();
