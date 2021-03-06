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
			top : 5,bottom:5,
			right : 25,
			height : Ti.UI.SIZE,
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				top : 0,
				textAlign : 'left',
				height : Ti.UI.SIZE,
				font : {
					fontSize : 22,
					fontWeight : 'bold'
				},
				left : 0,
				right : 0
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'summary',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				textAlign : 'left',
				font : {
					fontSize : 16,
				},
				top : 0
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'lastpubdate',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				font : {
					fontSize : 12,
				},
				left : 0,
				right : 20,
				top : 1,
				bottom : 1
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'entries',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				textAlign : 'left',
				font : {
					fontSize : 12,
				},
				top : 1,
				bottom : 1
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'weight',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				font : {
					fontSize : 12,
				},
				left : 0,
				right : 20,
				top : 1,
				bottom : 1
			}
		}]
	}],
};
exports.fav = {
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
			right : 25,
			height : Ti.UI.SIZE,
		},
		childTemplates : [{
			type : 'Ti.UI.Label',
			bindId : 'title',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				top : 0,
				textAlign : 'left',
				height : Ti.UI.SIZE,
				font : {
					fontSize : 22,
					fontWeight : 'bold'
				},
				left : 0,
				right : 0
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'lastpubdate',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				font : {
					fontSize : 12,
				},
				left : 0,
				right : 20,
				top : 1,
				
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'entries',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				textAlign : 'left',
				font : {
					fontSize : 12,
				},
				top : 1,
				
			}
		}, {
			type : 'Ti.UI.Label',
			bindId : 'weight',
			properties : {
				color : '#555',
				width : Ti.UI.FILL,
				height : Ti.UI.SIZE,
				font : {
					fontSize : 12,
				},
				left : 0,
				right : 20,
				top : 1,
				
			}
		}]
	}],
};


