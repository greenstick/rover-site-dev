////////////////////////////////////////////////////////////////////////////////////////////////////////

/*				  
Core Prototype
*/

////////////////////////////////////////////////////////////////////////////////////////////////////////			  

(function () {
	var press = document.querySelector("#press .blurbs");
	var msnry = new Masonry (press, {
		itemSelector: '.blurb',
		columnWidth: 320
	});
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
			// console.log(this.scrollData);
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
		//Direct Page Navigation
		Core.prototype.to 				= function (e) {

		};

	/* 		  
	UI & Event Triggered Methods
	*/		

		//Set Body Heigh on Resize
		Core.prototype.resize 			= function (e) {
			var height = e.currentTarget.innerHeight;
				$('body').height(height);
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
Event Bindings
*/		

		//Resize
		$(window).on("resize", function (e) {
			var resize;
			clearTimeout(resize);
			resize = setTimeout(function () {
				core.resize(e);
				masonry.reloadItems();
			}, 200)
		});
		$(window).load(function (e) {
			core.resize(e);
			masonry.reloadItems();
		});
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

}(jQuery, d3, ko));