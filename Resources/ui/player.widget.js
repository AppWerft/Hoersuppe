module.exports = function(item) {
	var self = Ti.UI.createView();
	self.add(Ti.UI.createView({
		backgroundColor : '#000',
		opacity : 0.8,
		top : 0
	}));
	self.list = Ti.UI.createView({
		width : 240,
		backgroundColor : 'white',
		height : Ti.UI.SIZE   
	});
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
		top : 240,
		ellipsize : true,
		html : item.description
	}));
	self.player = Ti.Media.createVideoPlayer({
		height : 70,
		backgroundColor : '#408B4D',
		top : 310,
		allowsAirPlay : true,
		autoplay : true,
		mediaControlStyle : Ti.Media.VIDEO_CONTROL_EMBEDDED,
		url : item.url
	});
	self.list.add(self.player);
	self.add(self.list);
	self.player.play();
	return self;
};