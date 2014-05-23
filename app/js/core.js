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
			core.subPage 		= 		args.subPage  		|| 		'.subPage',
			core.fader 			=		args.fader 			|| 		'.fader',
			core.menu 			=		args.menu 			|| 		'#menu',
			core.menuOpen 		= 		args.menuOpen 		|| 		'.menu-open',
			core.menuSelection	=		args.menuSelection 	|| 		'#menu .button',
			core.current 		= 		args.current 		|| 		'current',
			core.videoElement 	= 		args.videoElement 	|| 		'.video-element',
			core.mobile 		= 		(Modernizr.touch) ? true : false,
			core.scrollData 	= 		{},
			core.scrolling 		= 		false,
			core.videos 		= 		{},
			core.resizing,
			core.currentVideo,
			core.height,
			core.width,
			core.delta;
	};

	/*
	Controlled Scrolling Navigation
	*/

		//Bind Scroll Handler to Touch Events or Other Scroll Event
		Core.prototype.bindScroll  			= function () {
			var start = {x: 0, y: 0}, core = this;
			//Mobile
			if (core.mobile === true) {
				if (window.addEventListener) {
					window.addEventListener("touchstart", touchStart, false);
					window.addEventListener("touchmove", touchMove, false);
				}
				touchStart = function (e) {
					start.x = e.touches[0].pageX;
					start.y = e.touches[0].pageY;
				};
				touchMove = function (e) {
					offset = {};
					offset.y = start.y - e.touches[0].pageY;
					core.delta = (offset.y);
					if (Math.abs(core.delta) >= 10) {
						$(core.wrapper).on('touchmove', function (e) {
							e.preventDefault ? e.preventDefault() : e.returnValue = false;
							core.scrollDirection(core.delta);
						});
					};
				};
			//Non-Mobile
			} else {
				$(core.wrapper).on('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {
					core.delta = 0;
					if (!e) e = window.event;
					if (e.originalEvent.wheelDelta) {
						core.delta = e.originalEvent.wheelDelta / 120;
					} else if (e.originalEvent.detail) {
						core.delta = - e.originalEvent.detail / 3;
					};
					if (core.delta) {
						core.scrollDirection();
						e.preventDefault ? e.preventDefault() : e.returnValue = false;
					};
				});
			};
		};

		//Determined direction to Scroll and Calls scrollPage Function
		Core.prototype.scrollDirection 	= function () {
			var core = this;
			if (core.scrolling === false) {
				if (core.delta < -1.25) {
					core.scrolling = true;
					core.scrollPage('next');
				} else  if (core.delta > 1.25) {
					core.scrolling = true;
					core.scrollPage('prev');
				};
			};
		};

		//Scrolls to Next or Previous Page
		Core.prototype.scrollPage		= function (destination) {
			var core = this, id;
			//Next Page
			if (destination === 'next') {
				if ($('#credits').hasClass('current')) {
					core.scrolling = false;
					return;
				} else {
					$('.' + core.current).removeClass(core.current).next().addClass(core.current);
					id = $('.' + core.current).attr("id");
					var navTimer = setTimeout(function () {
						core.navTo(id);
					}, 600);
				};
			//Previous Page
			} else {
				if ($('#home').hasClass(core.current)) {
					core.scrolling = false;
					return;
				} else {
					$('.' + core.current).removeClass(core.current).prev().addClass(core.current);
					id = $('.' + core.current).attr("id");
					var navTimer = setTimeout(function () {
						core.navTo(id);
					}, 600);
				};
			};
		};

	/*
	Hash Navigation
	*/

		//Direct Page Hash Navigation
		Core.prototype.navTo 			= function (page) {
			var loc = (page) ? '#'+ page : (location.hash) ? location.hash : '#home', core = this;
			if (history.pushState) {
				history.pushState({}, document.title, loc);
			} else {
				location.hash = loc;
			};
			core.scrolling = true;
			$('.' + core.current).removeClass(core.current);
			$(loc).addClass(core.current);
			$(document).scrollTo(loc, {
				duration: 600,
					axis: "y"
			});
			core.scrolling = false;
		};

	/* 		  
	UI & Event Triggered Methods
	*/		

		//Set Body and Container Heights on Resize
		Core.prototype.resize 			= function (e) {
			var core = this;
				core.height = e.currentTarget.innerHeight;
				core.width  = e.currentTarget.innerWidth;
			$('body').width(core.width).height(core.height);
			$(core.pageClass).width(core.width).height(core.height);
			$(core.subPage).width(core.width).height(core.height);
		};
		//Fade Out Content When Interacting With Menu
		Core.prototype.fadeElements 	= function () {
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
		Core.prototype.menuOver 		= function () {
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
		
		Core.prototype.init 			= function () {
			console.log("Mobile: " + this.mobile);
			console.log("Scrolling: " + this.scrolling);
			console.log("Videos: " + this.videos);
		};			

		Core.prototype.toggleNav 		= function () {
			this.fadeElements();
			this.toggleMenu();
		};

/*		  
Instantiation
*/		  

		//New Core Prototype With Arguments
		var site = new Core({
			menu 			: '#navigation',
			menuSelection	: '.menu-item'
		});
		//Initialize
		site.init();

/*			
Core Event Bindings
*/		

		//Toggle Menu
		$(site.menuOpen).on("click", function (e) {
			site.toggleNav();
		});
		//Mouseover Menu Icon
		$(site.menuOpen).on("mouseover", function (e) {
			site.menuOver();
		});
		//Mouseout Menu Icon
		$(site.menuOpen).on("mouseover", function (e) {
			site.menuOut();
		});
		//Select Page From Menu
		$(site.menuSelection).on("click", function (e) {
			var page = $(this).data().to;
			site.navTo(page);
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
	        $(site.fader).fadeToggle();
	        //Add Bootstrap Class
	        $('body').addClass('modal-open');
	    });
	    //Close Zip Code Modal
	    $(zipModal.element + " " + zipModal.close).on("click", function () {
	        zipModal.closeModal();
	        $(site.fader).fadeToggle();
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
Video Player Methods
*/

	    //Creates VideoJS Instances
	    function newVideo (id) {
	    	var obj = {},
	    		video = '#' + id,
	            instance = videojs(video, {
	                "controls"      :       true,
	                "autoplay"      :       false, 
	                "preload"       :       "auto"
	            });
	            instance.ready(function () {
	                site.videos[id] = this;
	            });
	        return site.videos;
	    };
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
	    	//Setup Video
	    	site.currentVideo = video;
	        site.videos[video].currentTime(0);
	        site.videos[video].play();
	        videoModal.openModal();
	        //Fade in Elements
	        $("#" + video).show();
	    };
	    //Resets all Videos' Play Positions and Pauses them
	    function exitVideo () {
	    	videoModal.closeModal();
	    	$(site.videoElement).fadeOut();
    		site.videos[site.currentVideo].currentTime(0);
    		site.videos[site.currentVideo].pause();
	    };

/*
Video Modal Event Bindings
*/

	    //Open Video Modal
	    $(videoModal.open).on("click", function (e) {
	        var video = $(this).data().video;
		        newVideo(video);
		        resizeVideo();
		        playVideo(video);
	        //Add Bootstrap Class
	        $('body').addClass('modal-open');
	    });
	    //Close Video Modal
	    $(videoModal.element + " " + videoModal.close).on("click", function (e) {
	        exitVideo();
	        //Remove Bootstrap Class
	        $('body').removeClass('modal-open');
	    });

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Gallery
*/


		//Gallery Page Isotope
		var gallery = document.querySelector("#gallery");
		var galleryLayout = new Isotope (gallery, {
			itemSelector: '.galleryImg',
			masonry: {
			    // columnWidth: '.grid-sizer'
			    rowHeight: '.grid-sizer'
			}
			/*masonry: {
				rowHeight: ".grid-sizer"
			},*/
			// columnWidth: ".grid-sizer"
		});
		galleryLayout.bindResize();


		/*//Gallery Page Isotope
		var gallery = document.querySelector("#gallery");
		var galleryLayout = new Isotope (gallery, {
			layoutMode: 'masonryHorizontal',
			itemSelector: '.galleryImg',
			masonryHorizontal: {
				rowHeight: ".grid-sizer"
			}
		});
		galleryLayout.bindResize();*/






		//Gallery Page Isotope
		/*var gallery = document.querySelector("#gallery");
		var galleryLayout = new Isotope (gallery, {
			// layoutMode: 'masonryHorizontal',
			itemSelector: '.galleryImg'//,
			// columnWidth: '25%'
		});
		galleryLayout.bindResize();*/



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
		var press = document.querySelector("#press.page");
		var pressLayout = new Isotope (press, {
			itemSelector: '.blurb'
		});
		pressLayout.bindResize();

		//Trailers Page Masonry
		var trailers = document.querySelector("#trailers.page");
		var trailersLayout = new Isotope (trailers, {
			itemSelector: '.thumb-nail'
		});
		trailersLayout.bindResize();

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Global Event Bindings
*/

		//Setup DOM Sizing and Location
		$(window).load(function (e) {
			site.resize(e);
			resizeVideo();
			site.bindScroll();
			site.navTo();
		});

		//Resize
		$(window).on("resize", function (e) {
			var id;
			clearTimeout(site.resizing);
			site.resizing = setTimeout(function () {
				site.resize(e);
				resizeVideo();
				id = $('.' + site.current).attr("id");
				site.navTo(id);
			}, 400);
		});

}(jQuery, d3));
