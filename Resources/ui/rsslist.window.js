module.exports = function(_channel, _items) {
	var feed = _items;
	var bgfile = null;
	var channel = _channel;
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	var AudioDownloader = new (require('controls/audiodownloader_adapter'))();
	var Pusher   = new (require('controls/pushnotification_adapter'))();
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
	self.list = Ti.UI.createListView({
		templates : {
			'rss' : {
				properties : {
					height : Ti.UI.SIZE,
				},
				childTemplates : [{
					type : 'Ti.UI.ImageView',
					bindId : 'local',
					properties : {
						top : 90,
						left : 50,
						width : 30,
						height : 24,
						image : '/assets/local.png'
					}
				}, {
					type : 'Ti.UI.ImageView',
					bindId : 'cloud',
					properties : {
						left : 8,
						width : 32,
						height : 24,
						top : 90,
						image : '/assets/cloud.png'
					},
					events : {
						//click : onClick
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
	var dataitems = [];
	options.subtitle = feed.length + ' Beiträge';
	actionbar && actionbar.setSubtitle(options.subtitle);
	feed.forEach(function(item) {
		console.log(item);
		item.url = item.url;
		item.size = item.length;
		delete item.enclosure;
		item.islocal = AudioDownloader.isLocal(item);
		if (item.url)
			dataitems.push({
				properties : {
					itemId : JSON.stringify({
						url : item.url,
						title : item.title,
						feedname : channel.title,
						islocal : item.islocal,
						logo : channel.logo,
						description : item.description
					})
				},
				title : {
					text : item.title
				},
				local : {
					opacity : (item.islocal) ? 1 : 0.3
				},
				cloud : {
					opacity : (item.islocal) ? 0.3 : 1
				},
				description : {
					html : item.description.replace(/<img.*?>/gim,'')
				},
				logo : {
					image : channel.logo
				}
			});
	});
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
						showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
						isChecked : (HoerSuppe.isFav(channel)) ? true : false,
						icon : (HoerSuppe.isFav(channel)) ? Ti.App.Android.R.drawable.ic_action_good : Ti.App.Android.R.drawable.ic_action_bad,
						title : 'Merkliste'
					}).addEventListener("click", function() {
						var item = e.menu.findItem('0');
						if (item.isChecked()) {
							item.setIcon(Ti.App.Android.R.drawable.ic_action_bad), item.setChecked(false);
							self.close();
							HoerSuppe.removeFav(channel);
						} else {
							item.setChecked(true);
							console.log(channel);
							Pusher.subscribeToFavoriteFeed(channel.url);
							item.setIcon(Ti.App.Android.R.drawable.ic_action_good), HoerSuppe.addFav(channel);
						}
					});
					//activity.invalidateOptionsMenu();
					//activity.openOptionsMenu();
				};

			}
			setTimeout(function() {
				bgfile = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, 'BG.png');
				Ti.App.Properties.setString('BG', bgfile.nativePath);
				bgfile.write(self.toImage().media);
			}, 700);
		});
	};
	self.list.addEventListener('itemclick', function(_item) {
		require('ui/audioplayer/container')(JSON.parse(_item.itemId));
	});
	return self;
};

