var Module = function() {
	this.locked = false;
	return this;
};

Module.prototype = {
	createView : function(item) {
		this.item = item;
		this.view = Ti.UI.createView({
			height : 30,
			top : 0,
			backgroundColor : '#224929'
		});
		this.progress = Ti.UI.createProgressBar({
			left : 50,
			right : 10,
			min : 0,
			max : 1,
			visible : false,
			top : 0,
			width : Ti.UI.FILL,
			height : 30
		});
		this.label = Ti.UI.createLabel({
			left : 45,
			color : 'white',
			font : {
				fontSize : 11
			},
			text : '⇊ Hier ziehen startet Download ︎⇊'
		});
		this.view.add(this.label);
		this.view.add(this.progress);
		this.statuscloud = Ti.UI.createImageView({
			width : 27,
			height : 20,
			left : 10,
			opacity : (this.item.islocal) ? 0 : 1,
			image : '/assets/cloud.png'
		});
		this.statuslocal = Ti.UI.createImageView({
			left : 10,
			width : 27,
			height : 20,
			opacity : (this.item.islocal) ? 1 : 0,
			image : '/assets/local.png'
		});
		this.view.add(this.statuscloud);
		this.view.add(this.statuslocal);
		return this.view;
	},
	startDownload : function() {
		Ti.Media.vibrate();
		this.locked = true;
		var that = this;
		var AudioDownloader = new (require('controls/audiodownloader_adapter'))();
		AudioDownloader.saveAudioFile(this.item);
		console.log(this.item);
		this.progress.show();
		AudioDownloader.addEventListener('progress', function(_p) {
			that.progress.show();
			that.label.hide();
			that.statuscloud.setOpacity(1 - _p.progress);
			that.statuslocal.setOpacity(_p.progress);
			that.progress.setValue(_p.progress);
		});
		AudioDownloader.addEventListener('ready', function() {
			Ti.UI.createNotification({
				message : 'Podcasts erfolgreich runtergeholt! Kann jetzt auch ohne Neuland gehört werden.'
			}).show();
			Ti.Media.vibrate();
			that.progress.hide();
			that.view.hide();
		});
	}
};

module.exports = Module;
