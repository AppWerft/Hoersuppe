module.exports = function() {

	var self = Ti.UI.createWindow({
		backgroundColor : '#fff',
		fullscreen : true,
	});
	self.list = Ti.UI.createListView({
		templates : {
			'main' : require('ui/TEMPLATES').main
		},
		caseInsensitiveSearch : true,
		defaultItemTemplate : 'main'
	});
	var sections = [];
	self.updateList = function() {
		require('controls/podlove_adapter')(function(_res) {
			var posts = _res.posts;
			var items = [];
			posts.forEach(function(post) {
				var pod = post.podcast[0];

				var mp3 = undefined;
				pod['podbe_feed'].forEach(function(feed) {
					console.log(feed['podbe_feed_audio']);
					if (feed['podbe_feed_audio'] == 'Mp3' || feed['podbe_feed_audio'] == 'News')
						feedurl = feed['podbe_feed_url'].replace(/^feed:\/\//,'http://');
				});
				var item = {
					properties : {
						itemId : JSON.stringify({
							url : feedurl,
							description : pod['podcast_description'],
							title : pod['podcast_subtitle'],
							logo : pod['podcast_cover']
						}),
						accessoryType : Titanium.UI.LIST_ACCESSORY_TYPE_DETAIL
					},
					title : {
						text : pod['podcast_subtitle']
					},
					icon : {
						image : pod['podcast_cover']
					},
					summary : {
						text : pod['podcast_description']
					},
					entries : {
						height : 0
					},
					lastitem : {
						height : 0
					}
				};
				console.log(item);
				items.push(item);
			});
			sections.push(Ti.UI.createListSection({
				items : items,
			}));
			self.list.setSections(sections);
		});
	};
	self.updateList();
	self.add(self.list);
	self.list.addEventListener('itemclick', function(_e) {
		var feed = JSON.parse(_e.itemId);
		var windowmodule = require('ui/rsslist.window');
		var doOpenFeedWindow = function(items) {
			if (items) {
				windowmodule(feed, items).open();
				setTimeout(function() {
					self.remove(dialog);
				}, 100);
			} else {
				dialog.list.animate({
					duration : 700,
					transform : Ti.UI.create2DMatrix({
						scale : 0.01,
						rotate : 800
					})
				}, function() {
					self.remove(dialog);
				});
				Ti.UI.createNotification({
					message : 'Feed leider nicht auswertbar …'
				}).show();
			}

		};
		var dialog = require('ui/download.widget')(feed, doOpenFeedWindow);
		self.add(dialog);

		//
	});

	return self;
};
