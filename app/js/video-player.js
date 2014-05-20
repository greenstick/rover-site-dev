(function () {

/*
Video Player Prototype
*/

	var Video = function (args) {
		var video = this;
			video.player  		= 		videojs(args.id, {
				"controls"		: 		args.controls,
				"autoplay"		: 		args.autoplay, 
				"preload" 		: 		args.preload
			});
	};

	Video.prototype.muteVideo = function (e) {
		$(e).toggleClass("iconSpeaker-mute", "iconSpeaker-on");
	};

$("#mute-video").on("click", function (e) {
	video.muteVideo(e.currentTarget)
});

}(jQuery))