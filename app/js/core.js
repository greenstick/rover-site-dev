////////////////////////////////////////////////////////////////////////////////////////////////////////

/*				  
Core Prototype
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////			  

(function () {

	var Core = function (args) {
		var core = this;

			//Set Elements
			core.wrapper 		=		args.wrapper 		|| 		'#wrapper',
			core.pageClass 		= 		args.page 			||		'.page',
			core.fader 			=		args.fader 			|| 		'.fader',
			core.menu 			=		args.menu 			|| 		'#menu',
			core.menuOpen 		= 		args.menuOpen 		|| 		'.menu-open',
			core.menuSelection	=		args.menuSelection 	|| 		'#menu .button',
			core.scrollData 	= 		{};

	};

	/*			   
	Set Scroll Data Object
	*/			   

		//Updates Index, Scroll Top, and Scroll Left
		Core.prototype.updateScrollData = function (e) {
			this.scrollData = {
				index		: 	Math.round(e.view.scrollY / e.currentTarget.clientHeight),
				scrollTop	: 	e.view.scrollY,
				scrollLeft 	: 	e.view.scrollX,
				width 		: 	e.currentTarget.clientWidth,
				height 		: 	e.currentTarget.clientHeight
			};
			console.log(this.scrollData);
		};
		//Set/Reset Scroll Data
		Core.prototype.resetScrollData = function (e) {
			this.scrollData = {
				index 		: 	Math.round(e.currentTarget.scrollY / e.currentTarget.innerHeight),
				scrollTop 	: 	e.currentTarget.scrollY,
				scrollLeft 	: 	e.currentTarget.scrollX,
				width 		: 	e.currentTarget.innerWidth,
				height 		: 	e.currentTarget.innerHeight
			};
			// console.log(this.scrollData);
		};
		Core.prototype.setHash 			= function () {
			if (location.hash == '') {
				location.hash = '#home';
			};
		};
		//Direct Page Navigation
		Core.prototype.navTo 			= function (page) {
			if (history.pushState) history.pushState({}, document.title, '#' + page);
			$(document).scrollTo('#' + page, {
				duration: 600,
					axis: "y"
			});
		};
		//Scroll to Navigation
		Core.prototype.to 				= function (e) {
			var lastScrollTop = 0,
				winHeight = $(window).innerHeight(),
				winTop    = $(window).scrollTop(),
				docHeight = $(document).height(),
				scrollDirection = (lastScrollTop >= winTop) ? 'up' : 'down';

			console.log(e);
		};

	/* 		  
	UI & Event Triggered Methods
	*/		

		//Set Body Heigh on Resize
		Core.prototype.resize 			= function (e) {
			var height = e.currentTarget.innerHeight;
			var width  = e.currentTarget.innerWidth;
				$('body').height(height);
				$('.subPage').width(width);
		};
		//Fade Out Content When Interacting With Menu
		Core.prototype.fadeElements 		= function () {
			var core = this;
			$(core.fader).fadeToggle();
		};
		//Toggle Menu 
		Core.prototype.toggleMenu 		= function () {
			var core = this;
			$(core.menu).toggleClass('active');
			$(core.menuOpen).toggleClass('close');
		};
		//Mouseover Menu Icon
		Core.prototype.menuOver 			= function () {
			var core = this;
			$(core.menuOpen).addClass('active');
		};
		//Mouseout Menu Icon
		Core.prototype.menuOut 			= function () {
			var core = this;
			$(core.menuOpen).removeClass('active');
		};

/*		   
Macro Methods
*/		   
		
		//Initialization Function
		Core.prototype.init 				= function () {
			console.log('initialized');
		};
		Core.prototype.toggleNav 			= function () {
			this.fadeElements();
			this.toggleMenu();
		};

/*		  
Instantiation
*/		  

		//New Core Prototype With Arguments
		var core = new Core({
			menu 			: '#navigation',
			menuSelection	: '.menu-item'
		});
		//Set Scroll Data Object
		$(window).load(function (e) {
			core.resetScrollData(e);
		});
		//Initialize
		core.init();

/*			
Core Event Bindings
*/		

		//Toggle Menu
		$(core.menuOpen).on("click", function (e) {
			core.toggleNav();
		});
		//Mouseover Menu Icon
		$(core.menuOpen).on("mouseover", function (e) {
			core.menuOver();
		});
		//Mouseout Menu Icon
		$(core.menuOpen).on("mouseover", function (e) {
			core.menuOut();
		});
		//Update Scroll Data Object
		$(core.pageClass).on("click", function (e) {
			core.updateScrollData(e);
		});
		$(core.menuSelection).on("click", function (e) {
			var page = $(this).data().to;
			core.navTo(page);
		});

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
Release Dates Modal
*/
		//Instantiation
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
Extends Modal Prototype - Performs Zipcode Validation
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

/*
Zip Validation Event Binding
*/

	    //Enable Enter to Submit Input
	    $('#zipcode-modal .input').on("keyup", function (e) {
	        if (e.keyCode == 13) {
	            $('.submit img').click();
	        };
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

	    //Creates VideoJS Instances
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
	    //Instantiate Instances
	    var videos = newVideos(args);
	    //Resize Videos
	    function resizeVideo () {
	        var width = $(this).width() * 0.8;
	        var height = $(this).height() * 0.8;
	        var $videos = $("#video-1, #video-2, #video-3, #video-4");
	        if (width/height >= 16/9) {
	            $videos.width(width);
	            $videos.height(width * (10/24));
	        } else {
	            $videos.height(height);
	            $videos.width(height * (24/10));
	        };
	    };
	    //Plays Video
	    function playVideo (video) {
	        videos[video].currentTime(0);
	        videos[video].play();
	    };
	    //Resets all Videos' Play Positions and Pauses them
	    function resetVideos (video) {
	        for (var i = 0; i < video.length; i++) {
	            videos[video[i]].currentTime(0);
	            videos[video[i]].pause();
	        };
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
	        resetVideos(["video-1", "video-2", "video-3", "video-4"]);
	        videoModal.closeModal();
	        $('.video-element').fadeOut();
	        $('.fader').fadeToggle();
	        //Remove Bootstrap Class
	        $('body').removeClass('modal-open');
	    });

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Director's Statement Scrolling
*/

		//Scroll to Statement .subPage
		function toStatement (parent, element, blurb, easing, duration) {
			$(parent).scrollTo(element, {
				duration: duration,
				axis: "x"
			});
		};

/*
Statement Event Bindings
*/
		//Statement 1 to Statement 2
		$("#statement1 .next").on("click", function () {
			toStatement('#statement', '#statement2', '#statement1 .blurb', 'easeOutCirc', 800);
		});
		//Statement 2 to Statement 3
		$('#statement2 .next').on("click", function () {
			toStatement('#statement', '#statement3', '#statement2 .blurb', 'easeOutCirc', 800);
		});
		//Statement 2 to Statement 1
		$('#statement2 .prev').on("click", function () {
			toStatement('#statement', '#statement1', '#statement2 .blurb', 'easeOutCirc', 800);
		});
		//Statement 3 to Statement 2
		$("#statement3 .prev").on("click", function () {
			toStatement('#statement', '#statement2', '#statement3 .blurb', 'easeOutCirc', 800);
		});

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Masonry
*/

		//Press Page Masonry
		var press = document.querySelector("#press");
		var pressLayout = new Isotope (press, {
			itemSelector: '.blurb'
		});
		pressLayout.bindResize();
		//Trailers Page Masonry
		var trailers = document.querySelector("#trailers");
		var trailersLayout = new Isotope (trailers, {
			itemSelector: '.thumbnail'
		});
		trailersLayout.bindResize();

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Global Event Bindings
*/

		//Setup DOM Sizing and Location
		$(window).load(function (e) {
			core.setHash();
			core.resize(e);
			resizeVideo();
			pressLayout.reloadItems();
			trailersLayout.reloadItems();
		});
		//Resize
		$(window).on("resize", function (e) {
			var resize;
			clearTimeout(resize);
			resize = setTimeout(function () {
				core.resize(e);
				resizeVideo();
			}, 200);
		});
		//Window Scroll
		$(window).on("scroll", function (e) {
			core.to(e);
		});


}(jQuery, d3, ko));