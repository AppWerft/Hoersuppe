module.exports = function(_e) {
	var closing = false;
	var keys = [];
	var onClick = function(e) {
		var item = e.section.getItemAt(e.itemIndex);
		var onProgress = function(_p) {
			if (!closing) {
				var percent = Math.round(_p.progress);
				item.down.image = (percent % 2) ? '/assets/down.png' : '/assets/down_.png';
				item.progress.width = percent + '%';
				e.section.updateItemAt(e.itemIndex, item);
			}
		};
		var HoerSuppe = require('controls/hoersuppe_adapter');
		var key = Ti.Utils.md5HexDigest(JSON.parse(item.properties.itemId).url);
		keys.push(key);
		var client = HoerSuppe.save(JSON.parse(item.properties.itemId), {
			onsaved : function() {
				item.down.opacity = 0;
				item.progress.opacity = 0;
				Ti.UI.createNotification({
					message : 'Podcast erfolgreich auf diesem Dings runtergeladen.'
				}).show();
			}
		});
		Ti.App.addEventListener('app:downloadprogress:' + key, onProgress);
	};

	var options = JSON.parse(_e);
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
	require('controls/getrss')(options.key, function(_items) {
		if (!_items) {
			alert('Dieser Feed kann nicht gelesen werden.');
			self.close();
		}
		var dataitems = [];
		actionbar.setSubtitle(_items.length + ' Beiträge');
		for (var i = 0; i < _items.length; i++) {
			var item = _items[i];
			var url = item.enclosure && item.enclosure.url;
			if (url)
				dataitems.push({
					properties : {
						itemId : JSON.stringify({
							url : url,
							title : item.title,
							logo : options.logo
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
						image : options.logo
					}
				});
		}
		self.list.sections[0].setItems(dataitems);
	});

	if (Ti.Android) {
		self.addEventListener("open", function() {
			var activity = self.getActivity();
			if (activity && activity.actionBar) {
				actionbar = activity.actionBar;
				actionbar.setDisplayHomeAsUp(true);
				actionbar.setTitle(options.title);
				actionbar.onHomeIconItemSelected = function() {
					Ti.UI.createNotification({
						message : 'Download läuft im Hintergrund weiter'
					}).show();
					closing = true;
					setTimeout(function() {
						self.close();
					}, 1000);
				};
				activity.onCreateOptionsMenu = function(e) {
					e.menu.add({
						title : 'Bestellen',
						itemId : '0',
						showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
						icon : Ti.App.Android.R.drawable.ic_action_favorite
					}).addEventListener("click", function() {
						if (Ti.App.Properties.hasProperty('myfavs')) {
							var favs = Ti.App.Properties.getList('myfavs');
						} else
							favs = [];
						console.log(favs);
						favs.unshift(options);
						Ti.App.Properties.setList('myfavs', favs);
						e.menu.findItem('0').setEnabled(false);
					});
				};
			}
		});
	};
	self.addEventListener('androidback', function() {
		for (var i = 0; i < keys.length; i++) {
			//Ti.App.removeEventListener('app:downloadprogress:' + keys[], onProgress);
		}
		closing = true;
		console.log('Info: detecting of androidback event');
		Ti.UI.createNotification({
			message : 'Download läuft im Hintergrund weiter'
		}).show();

		setTimeout(function() {
			console.log('Info: detecting of androidback event ==> try to close window');
			self.close();
		}, 500);
	});
	return self;
};

