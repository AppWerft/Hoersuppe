var Module = function() {
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
		this.view.progress = Ti.UI.createProgressBar({
			left : 50,
			right : 10,
			min : 0,
			max : 1,
			top : 0,
			width : Ti.UI.FILL,
			height : 30
		});
		this.view.add(this.view.progress);
		this.view.statuscloud = Ti.UI.createImageView({
			width : 27,
			height : 20,
			left : 10,
			opacity : (this.item.islocale) ? 0 : 1,
			image : '/assets/cloud.png'
		});
		this.view.statuslocal = Ti.UI.createImageView({
			left : 10,
			width : 27,
			height : 20,
			opacity : (this.item.islocal) ? 1 : 0,
			image : '/assets/local.png'
		});
		this.view.add(this.view.statuscloud);
		this.view.add(this.view.statuslocal);
		return this.view;
	},
	startDownload : function() {
		Ti.Media.vibrate();
		var AudioDownloader = new (require('controls/audiodownloader_adapter'))();
		AudioDownloader.saveAudioFile(this.item);
		console.log(this.item);
		this.view.progress.show();
		AudioDownloader.addEventListener('progress', function(_p) {
			this.view.statuscloud.setOpacity(1 - _p.progress);
			this.view.statuslocal.setOpacity(_p.progress);
			this.view.progress.setValue(_p.progress);
		});
		AudioDownloader.addEventListener('ready', function() {
			Ti.UI.createNotification({
				message : 'Podcasts erfolgreich runtergeholt! Kann jetzt auch ohne Neuland gehört werden.'
			}).show();
			Ti.Media.vibrate();
			this.view.progress.hide();
			this.view.hide();
		});
	}
};

module.exports = Module;
