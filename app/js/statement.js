(function () {

	var Statement = function (args) {
		var s = this;
			s.index 		= 	1,
			s.parent 		= 	args.parent,
			s.viewport 		= 	args.viewport,
			s.slide 		= 	args.slide,
			s.navigation 	= 	args.navigation
	};
}(jQuery))