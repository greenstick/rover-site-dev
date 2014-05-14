/*				  
Rover Site Prototype
*/				  

var Rover = function (args) {
	var main = this;

		//Set Elements
		main.wrapper 		=		args.wrapper 		|| 		'#wrapper',
		main.pageClass 		= 		args.page 			||		'.page',
		main.fader 			=		args.fader 			|| 		'.fader',
		main.menu 			=		args.menu 			|| 		'#menu',
		main.menuOpen 		= 		args.menuOpen 		|| 		'.menu-open',
		main.menuSelection	=		args.menuSelection 	|| 		'#menu .button',
		main.scrollData 	= 		{};

};

/*
Micro Methods
*/

	/*			   
	Set Scroll Data
	*/			   

	//Updates Index, Scroll Top, and Scroll Left
	Rover.prototype.updateScrollData = function (e) {
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
	Rover.prototype.resetScrollData = function (e) {
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
	Rover.prototype.to 				= function (e) {

	};

	/* 		  
	UI & Event Triggered Methods
	*/		  

	//Fade Out Content When Interacting With Menu
	Rover.prototype.fadeElements 	= function () {
		var main = this;
		$(main.fader).fadeToggle();
	};
	//Toggle Menu 
	Rover.prototype.toggleMenu 		= function () {
		var main = this;
		$(main.menu).toggleClass('active');
		$(main.menuOpen).toggleClass('close');
	};
	//Mouseover Menu Icon
	Rover.prototype.menuOver 		= function () {
		var main = this;
		$(main.menuOpen).addClass('active');
	};
	//Mouseout Menu Icon
	Rover.prototype.menuOut 		= function () {
		var main = this;
		$(main.menuOpen).removeClass('active');
	};

/*		   
Macro Methods
*/		   
	
	//Initialization Function
	Rover.prototype.init 			= function () {
		console.log('initialized');
	};
	Rover.prototype.toggleNav 		= function () {
		this.fadeElements();
		this.toggleMenu();
	};

/*		  
Instatiation
*/		  

	//New Main Prototype With Arguments
	var main = new Rover({
		menu 			: '#navigation',
		menuSelection	: '.menu-item'
	});
	//Set Scroll Data Object
	$(window).load(function (e) {
		main.resetScrollData(e);
	});
	//Initialize
	main.init();

/*			
Event Bindings
*/			

	/*
	Menu
	*/

	//Toggle Menu
	$(main.menuOpen).on("click", function (e) {
		main.toggleNav();
	});
	//Mouseover Menu Icon
	$(main.menuOpen).on("mouseover", function (e) {
		main.menuOver();
	});
	//Mouseout Menu Icon
	$(main.menuOpen).on("mouseover", function (e) {
		main.menuOut();
	});
	//Update Scroll Data Object
	$(main.pageClass).on("click", function (e) {
		main.updateScrollData(e);
	});

	/*
	Scrolling
	*/