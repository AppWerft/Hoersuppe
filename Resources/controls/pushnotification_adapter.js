/* static embeddings*/
var Cloud = require('ti.cloud');
// http://www.blisstering.com/blog/implementing-apple-push-notification-titanium
/* constructor */
var Module = function() {
	this.eventhandlers = {};
	this.deviceToken = Ti.App.Properties.getString('deviceToken', Ti.Network.remoteDeviceUUID);
	this._loginUser();
};

Module.prototype = {
	_loginUser : function() {
		var that = this;
		Cloud.Users.login({
			login : "dummy",
			password : "dummy"
		}, function(e) {
			if (e.success) {
				that.fireEvent('user_loggedin', {
					user : e.users[0]
				});
				that._subscribe2notification();
				console.log('Info: user login was successful ~~~~~~~~~~~~~~~~~~~~');
			} else {
				console.log('Error: user login failed');
			}
		});
	},
	_subscribe2notification : function() {
		this.loggedin = false;
		var that = this;
		var ostype = Ti.Platform.osname;
		if (ostype === "android" && Ti.Platform.Android.API_LEVEL > 12 && Ti.Network.online == true) {
			var CloudPush = require('ti.cloudpush');
			CloudPush.showTrayNotificationsWhenFocused = true;
			CloudPush.focusAppOnPush = true;
			CloudPush.showTrayNotification = true;
			CloudPush.singleCallback = false;
			CloudPush.retrieveDeviceToken({
				success : function(e) {
					Ti.App.Properties.setString('deviceToken', e.deviceToken);
					console.log('Info: subscribing to pushnot was successful ~~~~~~~~~~~~~~~~~~' + e);
					that.deviceToken = e.deviceToken;
					that._subscribeToAlertFeed();
				},
				error : function(e) {
					console.log('Error: ' + e);
				}
			});
			CloudPush.addEventListener('trayClickLaunchedApp', function(_payload) {
				Ti.API.info(_payload);
			});
			CloudPush.addEventListener('trayClickFocusedApp', function(_payload) {
				Ti.API.info(_payload);
			});
		}
		if (ostype === "iphone" || ostype === "ipad") {// iPhone/iPad
			// Ask for APN registration
			Ti.Network.registerForPushNotifications({
				success : function(e) {
					that.deviceToken = e.deviceToken;
					Ti.App.Properties.setString('deviceToken', e.deviceToken);
					that._subscribeToAlertFeed();

					//	that.deviceToken = e.deviceToken; // ????
				},
				error : function(e) {
				},
				callback : function(e) {
					var payload = e.data;
					if (e.inBackground) {
					} else {
					}
				},
				types : [Ti.Network.NOTIFICATION_TYPE_BADGE, Ti.Network.NOTIFICATION_TYPE_ALERT, Ti.Network.NOTIFICATION_TYPE_SOUND]
			});
		}
	},
	_subscribeToAlertFeed : function() {
		var that = this;
		Cloud.PushNotifications.subscribeToken({
			"channel" : 'alert',
			"device_token" : that.deviceToken,
			"type" : Ti.Platform.name == 'android' ? 'android' : 'ios'
		}, function(e) {
			
		});
	},
	subscribeToFavoriteFeed : function(_url) {
		var that = this;
		Cloud.PushNotifications.subscribeToken({
			"channel" : _url,
			"device_token" : that.deviceToken,
			"type" : Ti.Platform.name == 'android' ? 'android' : 'ios'
		}, function(e) {
			console.log(e);
		});
	},
	unsubscribeFromFavoriteFeed : function(_url) {
		var that = this;
		Cloud.PushNotifications.unsubscribeToken({
			channel : _url,
			device_token : that.deviceToken,
			type : Ti.Platform.name == 'android' ? 'android' : 'ios'
		}, _callback);
	},

	/* standard methods for event/observer pattern */
	fireEvent : function(_event, _payload) {
		if (this.eventhandlers[_event]) {
			for (var i = 0; i < this.eventhandlers[_event].length; i++) {
				this.eventhandlers[_event][i].call(this, _payload);
			}
		}
	},
	addEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			this.eventhandlers[_event] = [];
		this.eventhandlers[_event].push(_callback);
	},
	removeEventListener : function(_event, _callback) {
		if (!this.eventhandlers[_event])
			return;
		var newArray = this.eventhandlers[_event].filter(function(element) {
			return element != _callback;
		});
		this.eventhandlers[_event] = newArray;
	}
};

module.exports = Module;
