! function() {

	Object.prototype.toType = function() {
		return ({}).toString.call(this).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	};

	Ti.App.Pusher = new (require('controls/pushnotification_adapter'))();
	require('ui/tabgroup')().open();
}();
// http://jgilfelt.github.io/android-actionbarstylegenerator/#name=Hoersuppe&compat=holo&theme=dark&actionbarstyle=solid&texture=1&hairline=1&neutralPressed=1&backColor=224929%2C100&secondaryColor=408b4d%2C100&tabColor=c00%2C100&tertiaryColor=224929%2C100&accentColor=224929%2C100&cabBackColor=224929%2C100&cabHighlightColor=690%2C100