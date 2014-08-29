module.exports = function(parent) {
	var HoerSuppe = new (require('controls/hoersuppe_adapter'))();
	var Adapter = new (require('controls/audiodownloader_adapter'))();

	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
	});
	var bgfile = null;
	var lasturl = null;
	var lastitem = null, lastsection = null, lastindex = null;

	self.list = Ti.UI.createListView({
		bottom : 20,
		templates : {
			'rss' : {
				properties : {
					height : Ti.UI.SIZE,
				},
				childTemplates : [{
					type : 'Ti.UI.ImageView',
					bindId : 'play',
					properties : {
						top : 99,
						left : 5,
						width : 32,
						height : 32,

						image : '/assets/loud.png'
					},
					events : {
						click : function(playevent) {
							require('ui/audioplayer/container')(JSON.parse(playevent.section.getItemAt(playevent.itemIndex).properties.itemId));
						}
					},
				}, {
					type : 'Ti.UI.ImageView',
					bindId : 'trash',
					properties : {
						top : 100,
						left : 55,
						width : 27,
						height : 27,
						bottom : 10,
						image : '/assets/trash.png'
					},
					events : {
						click : function(trash_event) {
							var item = trash_event.section.getItemAt(trash_event.itemIndex);
							var dialog = Ti.UI.createAlertDialog({
								cancel : 1,
								buttonNames : ['Löschen', 'Behalten'],
								message : 'Den Podcast „' + item.title.text + '“ vom lokalen Speicher löschen?',
								title : 'Podcastlöschen '
							});
							dialog.addEventListener('click', function(dialog_evt) {
								if (dialog_evt.index != dialog_evt.source.cancel) {
									Adapter.deleteAudioFile(JSON.parse(item.properties.itemId));
									trash_event.section.deleteItemsAt(trash_event.itemIndex, 1);
								}
							});
							dialog.show();

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
						left : 100,
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
						logo : off.logo,
						feedname : off.feedname,
						islocal : true
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
		bgfile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'BG.png');
		bgfile.write(self.toImage().media);
		Ti.App.Properties.setString('BG', bgfile.nativePath);

	};

	self.add(self.list);
	self.list.addEventListener('itemclick', function(_item) {

	});

	self.addEventListener('focus', updateList);
	return self;
};
