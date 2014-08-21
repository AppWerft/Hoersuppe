exports.main = {
	properties : {
		height : Ti.UI.SIZE,
	},
	childTemplates : [{
		type : 'Ti.UI.ImageView',
		bindId : 'icon',
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
			top : 5,
			height : Ti.UI.SIZE,
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
				top : 0
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'summary',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				font : {
					fontSize : 16,
				},
				left : 0,
				right : 20,
				top : 5,
				bottom : 10
			}
		}]
	}],
};

