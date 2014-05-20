(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Modal Prototype
*/


	var Modal 		= function (args) {
		var modal 				= this;
			modal.element 		= args.element,
			modal.mask 			= args.mask 		|| 	false, //optional
			modal.open 			= args.open,
			modal.close 		= args.close;

        return this;
	};

/*
Basic Methods
*/

    //Open Modal
	Modal.prototype.openModal   = function () {
		var modal = this;
			if (this.mask !== false) {
				$(modal.mask).fadeIn();
			};
			$(modal.element).fadeIn();
	};
    //Close Modal
	Modal.prototype.closeModal  = function () {
		var modal = this;
			if (this.mask !== false) {
				$(modal.mask).fadeOut();
			};
			$(modal.element).fadeOut();
	};

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Release Dates Modal Instantiation
*/

	var releaseDates = new Modal ({
		element      : "#release-dates",
		open         : ".release-open",
		close        : ".closeIcon"
	});

/*
Release Dates Modal Event Bindings
*/

    //Open Release Dates Modal
	$(releaseDates.open).on("click", function () {
		releaseDates.openModal();
	});
    //Close Release Dates modal
	$(releaseDates.element + " " + releaseDates.close).on("click", function () {
		releaseDates.closeModal();
	});

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Zipcode Extends Modal Prototype - Performs Zipcode Validation
*/

    Modal.prototype.zipCode     = function (args) {
        var zip                     = this;
            zip.location            = args.location,
            zip.pattern             = /(\d{5}?)/,
            zip.zipcode             = ko.observable(),
            //Outputs HREF if Valid
            zip.valid               = ko.computed(function () {
                if (typeof zip.zipcode() === 'undefined') {
                    return;
                };
                if (zip.zipcode().match(zip.pattern)) {
                    var zipcode = zip.zipcode().substr(0, 5);
                    return zip.location + zipcode;
                };
            });
    };

/*
Zip Modal Instantiation
*/

    //Instantiate Modal
    var zipModal = new Modal({
        element     : "#zipcode-modal",
        mask        : "#mask",
        open        : "#getTickets",
        close       : ".closeIcon"
    });
    //Instantiate Zipcode Validation
    var zipValidation = zipModal.zipCode({
        location    :   "http://www.fandango.com/theRover_170724/movietimes?location="
    });
    //Apply Knockout Bindings
    ko.applyBindings(zipModal, document.getElementById("zipcode-modal"));

/*
Zip Validation Event Bindings
*/

    //Enable Enter to Submit Input
    $('#zipcode-modal .input').on("keyup", function (e) {
        if (e.keyCode == 13) {
            $('.submit img').click();
        };
    });

/*
Zip Modal Event Bindings
*/

    //Open Zip Code Modal
    $(zipModal.open).on("click", function () {
        zipModal.openModal();
        $('.fader').fadeToggle();
        //Add Bootstrap Class
        $('body').addClass('modal-open');
    });
    //Close Zip Code Modal
    $(zipModal.element + " " + zipModal.close).on("click", function () {
        zipModal.closeModal();
        $('.fader').fadeToggle();
        //Remove Bootstrap Class
        $('body').removeClass('modal-open');
    });

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Video Modal Instantiation
*/

    //Instantiate Modal
    var videoModal = new Modal({
        element     : "#videos",
        mask        : "#mask",
        open        : ".video-open",
        close       : ".closeIcon"
    });

/*
Video Player
*/
    var args        =  [
            {
                name        :   "video-1",
                id          :   "#video-1",
                controls    :   true,
                autoplay    :   false,
                preload     :   "auto",
            },
            {
                name        :   "video-2",
                id          :   "#video-2",
                controls    :   true,
                autoplay    :   false,
                preload     :   "auto",
            },
            {
                name        :   "video-3",
                id          :   "#video-3",
                controls    :   true,
                autoplay    :   false,
                preload     :   "auto",
            },
            {
                name        :   "video-4",
                id          :   "#video-4",
                controls    :   true,
                autoplay    :   false,
                preload     :   "auto",
            }
        ];

    //Create Videos
    function newVideos (args) {
        var obj = {};
        for (var i = 0; i < args.length; i++) {
            var instance = videojs(args[i].id, {
                "controls"      :       args[i].controls,
                "autoplay"      :       args[i].autoplay, 
                "preload"       :       args[i].preload
            });

            instance.ready(function () {
                obj[args[i].name] = this;
            });
        };
        return obj;
    };
    //Create Video Instances
    var videos = newVideos(args);

    //Resize Video
    function resizeVideo () {
        var width = $(this).width() * 0.8;
        var height = $(this).height() * 0.8;
        var $videos = $("#video-1, #video-2, #video-3, #video-4");
        if (width/height >= 16/9) {
            $videos.width(width);
            // $trailer.height(width * (9/16));
            $videos.height(width * (10/24));
        } else {
            $videos.height(height);
            // $trailer.width(height * (16/9));
            $videos.width(height * (24/10));
        };
    };
    function playVideo (video) {
        videos[video].currentTime(0);
        videos[video].play();
    };

/*
Video Modal Event Bindings
*/

    //Open Video Modal
    $(videoModal.open).on("click", function (e) {
        var video = $(this).data().video;
        $("#" + video).show();
        playVideo(video);
        videoModal.openModal();
        $('.fader').fadeToggle();
        //Add Bootstrap Class
        $('body').addClass('modal-open');
    });
    //Close Video Modal
    $(videoModal.element + " " + videoModal.close).on("click", function (e) {
        videoModal.closeModal();
        $('.video-element').fadeOut();
        $('.fader').fadeToggle();
        //Remove Bootstrap Class
        $('body').removeClass('modal-open');
    });
    //Size Video on Load
    $(window).load(function () {
        resizeVideo();
    });
    //Size Video on Window Resize
    $(window).resize(resizeVideo);

}(jQuery, ko, videojs));
