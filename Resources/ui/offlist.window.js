

module.exports = function() {
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
	});
	var lasturl = null;
	var lastitem = null, lastsection = null, lastindex = null;
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
						top : 53,
						left : 80,
						width : 40,
						height : 40,

						image : '/assets/loud.png'
					},
					events : {
						click : function(e) {
						}
					},
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
						layout : 'vertical',
						left : 130,
						top : 0,
						height : Ti.UI.SIZE,
						right : 5,
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
								fontSize : 20,
								fontWeight : 'bold'
							},
							left : 0,
							right : 20,
							top : 5
						}
					}]
				}],
			}
		},
		defaultItemTemplate : 'rss',
	});

	var sections = [Ti.UI.createListSection({
		headerTitle : null
	})];
	var updateList = function() {
		var offs = HoerSuppe.getAllAudioFiles(), items = [];
		if (!offs)
			return;
		for (var i = 0; i < offs.length; i++) {
			var off = offs[i];
			items.push({
				properties : {
					itemId : JSON.stringify({
						url : off.url,
						title : off.title,
						logo : off.logo
					})
				},
				title : {
					text : off.title
				},
				play : {},
				logo : {
					image : off.logo
				}
			});
		}
		sections[0].setItems(items);
		self.list.setSections(sections);
	};
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		var item = _e.section.getItemAt(_e.itemIndex);
		if (null != lastitem) {
			console.log('Info: was lastitem,restore old view');
			console.log(lastitem);
			lastitem.play.opacity = 1;
			lastsection.updateItemAt(lastindex, lastitem);
		}
		var url = JSON.parse(item.properties.itemId).url;
		Ti.App.AudioPlayer.release();
		if (Ti.App.AudioPlayer.playing) {
			console.log('Info: was playing try to stop');
			item.play.opacity = 1;
			Ti.App.AudioPlayer.stop();
		} else {
			console.log('Info: was not  playing try set URL ' + url);
			Ti.App.AudioPlayer.stop();
			item.play.opacity = 0.3;
			if (lasturl != url)
				setTimeout(function() {
					Ti.App.AudioPlayer.setUrl(url);
					Ti.App.AudioPlayer.play();
				}, 500);
		}
		if (lasturl == url) {
			item.play.opacity = 1;
		}
		lasturl = url;
		lastitem = item;
		lastindex = _e.itemIndex;
		lastsection = _e.section;
		console.log('Info: update player view');
		_e.section.updateItemAt(_e.itemIndex, item);

	});
	self.addEventListener('focus', updateList);
	return self;
};
