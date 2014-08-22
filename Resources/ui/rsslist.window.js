module.exports = function(_channel, _items) {
	var feed = _items;
	var channel = _channel;
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	var AudioDownloaderns = {};
	// ref lists of downloader
	var options = {};
	var onClick = function(e) {
		var item = e.section.getItemAt(e.itemIndex);
		var id = Ti.Utils.md5HexDigest(item.properties.itemId);
		var eventhandler = {
			onprogress : function(_p) {
				var percent = _p.progress;
				var old = (new Date()).getMilliseconds();
				item.down.image = ((new Date()).getSeconds() % 2) ? '/assets/down.png' : '/assets/down_.png';
				item.progress.width = percent + '%';
				e.section.updateItemAt(e.itemIndex, item);
				var neu = (new Date()).getMilliseconds();
				console.log(parseInt(neu) - parseInt(old));
			},
			onready : function() {
				AudioDownloader.removeEventListener('progress');
				AudioDownloader.removeEventListener('ready');
				delete AudioDownloaderns[id];
				item.down.opacity = 0;
				item.progress.opacity = 0;
				Ti.UI.createNotification({
					message : 'Podcast erfolgreich auf diesem Dings runtergeladen.'
				}).show();
			}
		};
		var AudioDownloader = new (require('controls/audiodownloader_adapter'))();
		AudioDownloader.saveAudioFile(JSON.parse(item.properties.itemId));
		AudioDownloader.addEventListener('ready', eventhandler.onready);
		AudioDownloader.addEventListener('progress', eventhandler.onprogress);
		AudioDownloaderns[id] = AudioDownloader;
	};

	var actionbar = null;
	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
		fullscreen : true,
		title : options.title,
		orientationModes : [Ti.UI.PORTRAIT, Ti.UI.UPSIDE_PORTRAIT]
	});

	self.spinner = Ti.UI.createActivityIndicator({
		style : (Ti.Android) ? Ti.UI.ActivityIndicatorStyle.BIG : Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
	});
	//self.add(self.spinner);
	self.list = Ti.UI.createListView({
		templates : {
			'rss' : {
				properties : {
					height : Ti.UI.SIZE,
				},
				childTemplates : [{
					type : 'Ti.UI.ImageView',
					bindId : 'play',
					properties : {
						top : 90,
						left : 50,
						width : 36,
						height : 36,
						image : '/assets/loud.png'
					},
					events : {
						click : function(e) {
							var item = e.section.getItemAt(e.itemIndex);
							var url = JSON.parse(item.properties.itemId).url;
							if (Ti.App.AudioPlayer.playing) {
								item.play.opacity = 1;
								Ti.App.AudioPlayer.release();
								Ti.App.AudioPlayer.stop();
							} else {
								Ti.App.AudioPlayer.setUrl(url);
								item.play.opacity = 0.3;
								Ti.App.AudioPlayer.play();
							}
							e.section.updateItemAt(e.itemIndex, item);
						}
					},
				}, {
					type : 'Ti.UI.ImageView',
					bindId : 'down',
					properties : {
						left : 5,
						width : 32,
						height : 32,
						top : 93,
						image : '/assets/down.png'
					},
					events : {
						click : onClick
					}
				}, {
					type : 'Ti.UI.ImageView',
					bindId : 'logo',
					properties : {
						top : 0,
						left : 0,
						width : 90,
						height : 90,
						image : channel.logo,
						defaultImage : '/assets/default.png'
					}
				}, {
					type : 'Ti.UI.View',
					properties : {
						top : 130,
						left : 5,
						bottom : 20,
						width : 80,
						height : 5,
						backgroundColor : '#ddd'
					},
					childTemplates : [{
						type : 'Ti.UI.View',
						bindId : 'progress',
						properties : {
							left : 0,
							backgroundColor : '#408B4D',
							width : 0,
						},
					}]
				}, {
					type : 'Ti.UI.View',
					properties : {
						layout : 'vertical',
						left : 100,
						top : 0,
						height : Ti.UI.SIZE,
						right : 10,
						bottom : 10
					},
					childTemplates : [{
						type : 'Ti.UI.Label',
						bindId : 'title',
						properties : {
							color : '#555',
							width : Ti.UI.FILL,
							height : Ti.UI.SIZE,
							font : {
								fontSize : 22,
								fontWeight : 'bold'
							},
							left : 0,
							right : 20,
							top : 5
						}
					}, {
						type : 'Ti.UI.Label',
						bindId : 'description',
						properties : {
							color : '#555',
							width : Ti.UI.FILL,
							height : Ti.UI.SIZE,
							font : {
								fontSize : 16
							},
							left : 0,
							top : 5
						}
					}]
				}],
			}
		},
		defaultItemTemplate : 'rss',
		sections : [Ti.UI.createListSection({
			headerTitle : null
		})]
	});
	self.add(self.list);
	self.spinner.show();
	var dataitems = [];
	options.subtitle = feed.length + ' Beiträge';
	actionbar && actionbar.setSubtitle(options.subtitle);
	for (var i = 0; i < feed.length; i++) {
		var item = feed[i];
		var url = item.enclosure && item.enclosure.url;
		if (url)
			dataitems.push({
				properties : {
					itemId : JSON.stringify({
						url : url,
						title : item.title,
						logo : channel.logo
					})
				},
				title : {
					text : item.title
				},
				play : {
					opacity : 1
				},
				down : {
					opacity : 1
				},
				progress : {},
				description : {
					html : item.description
				},
				logo : {
					image : channel.logo
				}
			});
	}
	self.list.sections[0].setItems(dataitems);

	if (Ti.Android) {
		self.addEventListener("open", function() {
			var activity = self.getActivity();
			if (activity && activity.actionBar) {
				actionbar = activity.actionBar;
				actionbar.setDisplayHomeAsUp(true);
				actionbar.setTitle(channel.title);
				options.subtitle && actionbar.setSubtitle(options.subtitle);
				actionbar.onHomeIconItemSelected = function() {
					self.close();
				};
				activity.onCreateOptionsMenu = function(e) {
					e.menu.add({
						itemId : '0',
						checkable : true,
						checked : HoerSuppe.isFav(channel),
						title : 'Merkliste',
						showAsAction : Ti.Android.SHOW_AS_ACTION_NEVER,
					}).addEventListener("click", function() {
						var item = e.menu.findItem('0');
						if (item.isChecked()) {
							item.setChecked(false);
							HoerSuppe.removeFav(channel);
						} else {
							item.setChecked(true);
							HoerSuppe.addFav(channel);
						}
					});
					//activity.invalidateOptionsMenu();
					//activity.openOptionsMenu();
				};

			}
		});
	};
	self.addEventListener('androidback', function() {
		for (var id in AudioDownloaderns) {
			console.log(id + ' ' + AudioDownloaderns[id].hasOwnProperty());
			if (!AudioDownloaderns[id].hasOwnProperty()) {
				//	AudioDownloaderns[id].removeEventListener('ready');
				//	AudioDownloaderns[id].removeEventListener('progress');
			}
		}
		setTimeout(function() {
			console.log('Info: detecting of androidback event ==> try to close window');
			self.close();
		}, 10);
	});
	return self;
};

