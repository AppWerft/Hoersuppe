module.exports = function(_parent) {
	var self = Ti.UI.createListView({
		templates : {
			'main' : require('ui/TEMPLATES').main
		},
		caseInsensitiveSearch : true,
		defaultItemTemplate : 'main',backgroundColor : '#fff',
	});
	var sections = [];
	self.updateList = function() {
		require('controls/podlove_adapter')(function(_payload) {
			var posts = _payload.posts;
			var items = [];
			posts.forEach(function(post) {
				console.log(post	);
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
			self.setSections(sections);
		});
	};
	self.updateList();
	self.addEventListener('itemclick', function(_e) {
		var feed = JSON.parse(_e.itemId);
		var windowmodule = require('ui/rsslist.window');
		var doOpenFeedWindow = function(items) {
			if (items) {
				windowmodule(feed, items).open();
				setTimeout(function() {
					_parent.remove(dialog);
				}, 100);
			} else {
				dialog.list.animate({
					duration : 700,
					transform : Ti.UI.create2DMatrix({
						scale : 0.01,
						rotate : 800
					})
				}, function() {
					_parent.remove(dialog);
				});
				Ti.UI.createNotification({
					message : 'Feed leider nicht auswertbar …'
				}).show();
			}

		};
		var dialog = require('ui/download.widget')(feed, doOpenFeedWindow);
		_parent.add(dialog);

		//
	});

	return self;
};
