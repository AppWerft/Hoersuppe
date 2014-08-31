var Moment = require('vendor/moment');

var Module = function(fav, section, index) {
	this.FeedAdapter = new (require('controls/rss_adapter'))();
	var that = this;
	this.item = {
		properties : {
			itemId : JSON.stringify({
				key : fav.key,
				title : fav.title,
				logo : fav.logo,
				url : fav.url
			}),
			accessoryType : Ti.UI.LIST_ACCESSORY_TYPE_DETAIL
		},
		icon : {
			image : fav.logo
		},
		title : {
			text : fav.title
		},
		entries : {
			text : ''
		},
		lastpubdate : {
			text : ''
		},
		weight : {
			text : ''
		}

	};
	this.FeedAdapter.addEventListener('getfeed:ready', function(_event) {
		var items = _event.result;
		if (items) {
			Moment.locale('en');
			var pubDate = Moment(items[0].pubDate);
			Moment.locale('de');
			var letztes = pubDate.format('D. MMMM YYYY');
			var weight = 0;
			items.forEach(function(item) {
				if (item)
					weight += parseInt(item.length);
			});
			that.item.weight.text = 'Gesamtlast: ' + (weight / 1000000000).toFixed(1) + ' GBytes';
			that.item.lastpubdate.text = 'jüngster Podcast: ' + letztes;
			that.item.entries.text = 'Anzahl der Podcasts: ' + items.length;
		} else
			console.log('Error: no item for ' + fav.key);
		section.updateItemAt(index, that.item);
	});
	this.FeedAdapter.start(fav, true);
	return this.item;
};

module.exports = Module;
