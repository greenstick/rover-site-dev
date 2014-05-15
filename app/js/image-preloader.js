(function () {
	var images = [
		'../app/img/map-interactive/background-present.jpg',
		'../app/img/map-interactive/background-future.jpg',
		'../app/img/map-interactive/dropdown.png', 
		'../app/img/map-interactive/shadow.png',
		'../app/img/backgrounds/home-bg.jpg',
		'../app/img/backgrounds/statement1-bg.jpg',
		'../app/img/backgrounds/statement2-bg.jpg',
		'../app/img/backgrounds/statement3-bg.jpg',
		'../app/img/backgrounds/videos-bg.jpg',
		'../app/img/backgrounds/gallery-bg.jpg',
		'../app/img/backgrounds/press-bg.jpg',
		'../app/img/backgrounds/credits-bg.jpg'
	],
	p = null,
	img = null;
	for (p in images) {
	    if (images.hasOwnProperty(p)) {
	        img = new Image();
	        img.src = images[p];
	        images[p] = img;
	    };
	};
})