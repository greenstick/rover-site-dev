////////////////////////////////////////////////////////////////////////////////////////////////////////

/*				  
Core Prototype
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////			  

(function () {

	var Core = function (args) {
		var core = this;

			//Set Elements
			core.wrapper 			=		args.wrapper 			|| 		'#wrapper',
			core.pageClass 			= 		args.page 				||		'.page',
			core.subPage 			= 		args.subPage  			|| 		'.subPage',
			core.menuMask			= 		args.menuMask		 	|| 		'#nav-mask',
			core.fader 				=		args.fader 				|| 		'.fader',
			core.isoFader 			= 		args.isoFader 			|| 		'.iso-fader',
			core.menu 				=		args.menu 				|| 		'#menu',
			core.menuOpen 			= 		args.menuOpen 			|| 		'.menu-open',
			core.menuSelection		=		args.menuSelection 		|| 		'#menu .button',
			core.current 			= 		args.current 			|| 		'current',
			core.resizer 			= 		args.resizer 			|| 		'#resizer',
			core.videoElement 		= 		args.videoElement 		|| 		'.video-element',
			core.loadScreen 		= 		args.loadScreen 		|| 		'#load-screen',
			core.firstPage 			= 		args.firstPage 			|| 		'.firstPage',
			core.lastPage 			= 		args.lastPage 			|| 		'.lastPage',
			core.mobile 			= 		(Modernizr.touch) 		? 		true 	: false,
			core.scrollData 		= 		{},
			core.scrolling 			= 		false,
			core.videos 			= 		{},
			core.startPosition,
			core.resizing,
			core.currentVideo,
			core.height,
			core.width,
			core.delta;
	};

	/*
	Controlled Scrolling
	*/

		//Determines Whether to Bind Scroll Handler to Touch Events or Desktop Scroll
		Core.prototype.bindScroll  		= function () {
			var core = this;
			//Mobile
			if (core.mobile === true) {
				$(core.pageClass).on("touchstart", function (e) {
					core.touchStart(e);
				});
				$(core.pageClass).on("touchmove", function (e) {
					core.touchMove(e);
				});
			//Non-Mobile - Bind Scroll Event
			} else {
				$(core.pageClass).on('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {
					core.scrollDelta(e);
				});
			};
		};



		//Set Scroll Delta
		Core.prototype.scrollDelta 		= function (e) {
			this.delta = 0;
			if (!e) e = window.event;
			if (e.originalEvent.wheelDelta) {
				this.delta = e.originalEvent.wheelDelta / 120;
			} else if (e.originalEvent.detail) {
				this.delta = - e.originalEvent.detail / 3;
			};
			if (this.delta) {
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				this.scrollDirection();
			};
		};

		//Set Touch Start Coordinates
		Core.prototype.touchStart 		= function (e) {
			var start = {x: 0, y: 0};
				start.x = e.originalEvent.pageX;
				start.y = e.originalEvent.pageY;
				this.startPosition = start;
		};

		//Binds touchmove Event to Delta
		Core.prototype.touchMove 		= function (e) {
			var offset = {};
			offset.x = this.startPosition.x - e.originalEvent.pageX;
			offset.y = this.startPosition.y - e.originalEvent.pageY;
			this.delta = offset.y;
			if (Math.abs(this.delta) >= 10) {
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				this.scrollDirection();
			};
		};

		//Determines direction to Scroll and Calls scrollPage Function
		Core.prototype.scrollDirection 	= function () {
			if (this.mobile === true) {
				if (this.scrolling === false) {
					if (this.delta > -1.25) {
						this.scrolling = true;
						this.scrollPage('next');
					} else  if (this.delta < 1.25) {
						this.scrolling = true;
						this.scrollPage('prev');
					};
				};
			} else {
				if (this.scrolling === false) {
					if (this.delta < -1.25) {
						this.scrolling = true;
						this.scrollPage('next');
					} else  if (this.delta > 1.25) {
						this.scrolling = true;
						this.scrollPage('prev');
					};
				};
			};
		};

		//Scrolls to Next or Previous Page
		Core.prototype.scrollPage		= function (destination) {
			var core = this, id;
			//Next Page
			if (destination === 'next') {
				if ($(core.lastPage).hasClass(core.current)) {
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
				if ($(core.firstPage).hasClass(core.current)) {
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
		Core.prototype.navTo 			= function (page, callback) {
			var loc = (page !== null && page !== undefined) ? '#'+ page : (location.hash) ? location.hash : '#home', link = loc.substr(1), core = this;
			if (history.pushState) {
				history.pushState({}, document.title, loc);
			} else {
				location.hash = loc;
			};
			core.scrolling = true;
			$('.' + core.current).removeClass(core.current);
			$(loc).addClass(core.current);
			$(core.menuSelection).removeClass('selected');
			$('#menu-' + link).addClass('selected');
			$(document).scrollTo(loc, {
				duration: 600,
					axis: "y"
			});
			core.scrolling = false;
			//If Callback
			if (typeof callback === 'function') callback();
		};

	/* 		  
	UI & Event Triggered Methods
	*/		

		//Set Body and Container Heights on Resize
		Core.prototype.resize 			= function (e, callback) {
			var core = this;
				core.height = e.currentTarget.innerHeight;
				core.width  = e.currentTarget.innerWidth;
			$('body').width(core.width).height(core.height);
			$(core.pageClass).width(core.width).height(core.height);
			$(core.subPage).width(core.width).height(core.height);
			//If Callback 
			if (typeof callback === 'function') callback();
		};

		Core.prototype.showResizer 		= function () {
			var core = this;
			$(core.resizer).addClass('resizing');
		};

		Core.prototype.hideResizer 		= function () {
			var core = this;
			setTimeout(function () {
				$(core.resizer).removeClass('resizing');
			}, 600);
		};

		//Fade Out Content When Interacting With Menu
		Core.prototype.fadeElements 	= function () {
			var core = this;
			$(core.fader).fadeToggle();
		};

		//Fade Out Isotope Elements
		Core.prototype.fadeIsoElements = function () {
			var core = this;
			$(core.isoFader).toggleClass('faded');
		};

		//Toggle Menu 
		Core.prototype.toggleMenu 		= function () {
			var core = this;
			$(core.menu).toggleClass('active');
			$(core.menuOpen).toggleClass('close');
			$(core.menuMask).toggleClass('menu-dismiss');
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

		//Menu Link Active
		Core.prototype.menuHoverOver 	= function (link) {
			var core = this;
			$(link).addClass('hover');
		};

		//Menu Link Inactive
		Core.prototype.menuHoverOut		= function () {
			var core = this;
			$(core.menuSelection).removeClass('hover');
		};   		

		//Show / Hide Navigation		
		Core.prototype.toggleNav 		= function () {
			this.fadeElements();
			this.fadeIsoElements();
			this.toggleMenu();
		};

/*		  
Instantiation
*/		  

		//New Core Prototype With Arguments
		var site = new Core({
			menu 			: '#navigation',
			menuSelection	: '.menu-item',
			resizer 		: '#resizing',
			firstPage 		: '#home',
			lastPage 		: '#credits'
		});

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
		$(site.menuOpen).on("mouseout", function (e) {
			site.menuOut();
		});

		//Page Link Hover Over
		$(site.menuSelection).on("mouseover", function (e) {
			var link = e.currentTarget;
			site.menuHoverOver(link);
		});

		//Page Link Hover Over
		$(site.menuSelection).on("mouseout", function (e) {
			site.menuHoverOut();
		});

		//Select Page From Menu
		$(site.menuSelection).on("click", function (e) {
			var page = $(this).data().to;
			site.navTo(page);
		});
		//Click Anywhere to Dismiss
		$(site.menuMask).on("click", function (e) {
			console.log('dismiss');
			site.toggleNav();
		});
		//Arrow Up & Down Navigation
		$(window).on('keydown', function (e) {
			if (e.keyCode == 40) (e.preventDefault(), site.scrollPage("next"));
	    	if (e.keyCode == 38) (e.preventDefault(), site.scrollPage("prev"));
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
			if (this.mask !== false) $(modal.mask).fadeIn();
			$(modal.element).fadeIn();
		};

	    //Close Modal
		Modal.prototype.closeModal  = function () {
			var modal = this;
			if (this.mask !== false) $(modal.mask).fadeOut();
			$(modal.element).fadeOut();
		};

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
                if (typeof zip.zipcode() === 'undefined') return;
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
        open        : ".getTickets",
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
	        site.fadeElements();
	        site.fadeIsoElements();
	        //Add Bootstrap Class
	        $('body').addClass('modal-open');
	    });

	    //Close Zip Code Modal
	    $(zipModal.element + " " + zipModal.close).on("click", function () {
	        zipModal.closeModal();
	        site.fadeElements();
	        site.fadeIsoElements();
	        //Remove Bootstrap Class
	        $('body').removeClass('modal-open');
	    });

/*
Zip Validation Event Binding
*/

	    //Enable Enter to Submit Input
	    $('#zipcode-modal .input').on("keyup", function (e) {
	        if (e.keyCode == 13) $('.submit img').click();
	    });

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
	        var width = site.width * 0.8,
	        height = site.height * 0.8;
	        if (width/height >= 16/9) {
	            $("#video-1, #video-2, #video-3").width(width).height(width * (10/24));
	        } else {
	            $("#video-1, #video-2, #video-3").height(height).width(height * (24/10));
	        };
	    };

	    //Plays Video
	    function playVideo (video) {
	    	//Setup Video
	    	site.currentVideo = video;
	        site.videos[video].currentTime(0);
	        site.videos[video].play();
	        videoModal.openModal();
	        $(videoModal.element).removeClass('hide');
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
	        	site.fadeElements();
	        	site.fadeIsoElements();
		        newVideo(video);
		        resizeVideo();
		        playVideo(video);
	        //Add Bootstrap Class
	        $('body').addClass('modal-open');
	    });

	    //Close Video Modal
	    $(videoModal.element + " " + videoModal.close).on("click", function (e) {
	        exitVideo();
	        site.fadeElements();
	        site.fadeIsoElements();
	        //Remove Bootstrap Class
	        $('body').removeClass('modal-open');
	    });

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Gallery
*/

		Modal.prototype.getGalleryImage = function(data) {
			var imageSource = $(data).attr('src');
			$('#galleryModal img').attr('src', imageSource);
		};

/*
Gallery Modal
*/
		//Instantiation
		var galleryModal = new Modal ({
			element      : "#galleryModal",
			mask         : "#mask",
			open         : ".gallery-open",
			close        : ".closeIcon"
		});



/*
Gallery Modal Event Bindings
*/

	    //Open Release Dates Modal
		$(galleryModal.open).on("click", function () {
			galleryModal.openModal();
		});
	    //Close Release Dates modal
		$(galleryModal.element + " " + galleryModal.close).on("click", function () {
			galleryModal.closeModal();
			galleryLayout.layout();
		});

		//Open Gallery Code Modal
	    $(galleryModal.open).on("click", function () {
	        galleryModal.openModal();
	        galleryModal.getGalleryImage($(this));
	        site.fadeElements();
	        site.fadeIsoElements();
	        //Add Bootstrap Class
	        $('body').addClass('modal-open');
	    });
	    //Close Gallery Code Modal
	    $(galleryModal.element + " " + galleryModal.close).on("click", function () {
	        galleryModal.closeModal();
	        site.fadeElements();
	        site.fadeIsoElements();
	        //Remove Bootstrap Class
	        $('body').removeClass('modal-open');
	    });

/*
Gallery Scrolling
*/

		//Scroll to Gallery Image Function
		function toGalleryImage (parent, element, duration) {
			$(parent).scrollTo(element, {
				duration: duration,
				axis: "x"
			});
		};

/*
Gallery Event Bindings
*/
		var currentGallerySlide = 1;

		$("#gallery .next").on("click", function () {
			if (currentGallerySlide < 12) {
				currentGallerySlide++;
			} else {
				currentGallerySlide = 1;
			};
			toGalleryImage('.gSlideContainer', '.gContainer' + currentGallerySlide, 800);
		});
		$("#gallery .prev").on("click", function () {
			if (currentGallerySlide > 1) {
				currentGallerySlide--;
			} else {
				currentGallerySlide = 12;
			};
			toGalleryImage('.gSlideContainer', '.gContainer' + currentGallerySlide, 800);
		});

/*
		$(".gContainer1 .next").on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer2', 800);
		});

		$('.gContainer2 .prev').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer1', 800);
		});
		$('.gContainer2 .next').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer3', 800);
		});

		$('.gContainer3 .prev').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer2', 800);
		});
		$('.gContainer3 .next').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer4', 800);
		});

		$('.gContainer4 .prev').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer3', 800);
		});
		$('.gContainer4 .next').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer5', 800);
		});

		$('.gContainer5 .prev').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer4', 800);
		});
		$('.gContainer5 .next').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer6', 800);
		});

		$('.gContainer6 .prev').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer5', 800);
		});
		$('.gContainer6 .next').on("click", function () {
			toGalleryImage('.gSlideContainer', '.gContainer7', 800);
		});*/

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Director's Statement Scrolling
*/

		//Scroll to Statement .subPage
		function toStatement (parent, element, duration) {
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
			toStatement('#statement', '#statement2', 800);
		});

		//Statement 2 to Statement 3
		$('#statement2 .next').on("click", function () {
			toStatement('#statement', '#statement3', 800);
		});

		//Statement 2 to Statement 1
		$('#statement2 .prev').on("click", function () {
			toStatement('#statement', '#statement1', 800);
		});

		//Statement 3 to Statement 2
		$("#statement3 .prev").on("click", function () {
			toStatement('#statement', '#statement2', 800);
		});

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Masonry Pages
*/

		// Trailers Page Masonry
		// var trailers = document.querySelector("#trailers .thumb-nails");
		// var trailersLayout = new Isotope (trailers, {
		// 	itemSelector: '.thumb-nail'
		// });

		//Press Page Masonry
		var press = document.querySelector("#press.page");
		var pressLayout = new Isotope (press, {
			itemSelector: '.blurb'
		});

		//Gallery Page MASONRY
		var gallery = document.querySelector("#gallery");
		var galleryLayout = new Isotope (gallery, {
			itemSelector: '.galleryImg'
		});

		// Gallery Page MASONRY HORIZONTAL
		/*var gallery = document.querySelector("#gallery");
		var galleryLayout = new Isotope (gallery, {
			layoutMode: 'masonryHorizontal',
			masonryHorizontal: {
				rowHeight: 100
			},
			itemSelector: '.galleryImg'
		});*/

////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
Global Event Bindings
*/

		//Setup DOM Sizing and Location
		$(window).load(function (e) {
			site.resize(e, function () {
				// trailersLayout.layout();
				galleryLayout.layout();
				pressLayout.layout();
				resizeVideo();
				site.bindScroll();
				$('#videos').addClass('hide');
				site.navTo(null, function () {
					setTimeout(function () {
						$(site.loadScreen).addClass('done')
					}, 200);
				});
			});
		});

		//Resize
		$(window).on("resize", function (e) {
			var id;
			site.showResizer();
			clearTimeout(site.resizing);
			site.resizing = setTimeout(function () {
				site.resize(e, function() {
					// trailersLayout.layout();
					pressLayout.layout();
					resizeVideo();
					galleryLayout.layout();
					id = $('.' + site.current).attr("id");
					site.navTo(id, function () {
						site.hideResizer();
					});
				});
			}, 400);
		});

}(jQuery, d3));
