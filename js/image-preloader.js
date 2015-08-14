(function () {
	var images = [
		'../app/img/loader/loading.gif',
		'../app/img/social/tumblr-logo.png',
		'../app/img/social/twitter-logo.png',
		'../app/img/social/facebook-logo.png',
		'../app/img/home/parallax-clouds.png',
		'../app/img/home/parallax-foreground.png',
		'../app/img/home/parallax-middleground.png',
		'../app/img/home/parallax-mountains.png',
		'../app/img/home/parallax-protagonist.png',
		'../app/img/home/rover-logo.png',
		'../app/img/home/loaded.png',
		'../app/img/home/zipcode.png',
		'../app/img/home/arrow.png',
		'../app/img/backgrounds/home-bg.jpg',
		'../app/img/backgrounds/statement1-bg.jpg',
		'../app/img/backgrounds/statement2-bg.jpg',
		'../app/img/backgrounds/statement3-bg.jpg',
		'../app/img/backgrounds/videos-bg.jpg',
		'../app/img/backgrounds/gallery-bg.jpg',
		'../app/img/backgrounds/press-bg.jpg',
		'../app/img/backgrounds/credits-bg.jpg',
		'../app/img/statement/next.png',
		'../app/img/statement/prev.png',
		'../app/img/map-interactive/background-present.jpg',
		'../app/img/map-interactive/background-future.jpg',
		'../app/img/map-interactive/dropdown.png', 
		'../app/img/map-interactive/shadow.png',
		'../app/img/trailers/rover-trailer.png',
		'../app/img/trailers/the-rover-teaser.png',
		'../app/img/trailers/god-gave-you-a-bullet.png',
		'../app/img/credits/block.svg'
	],
	p = null,
	img = null;
	for (p in images) {
		$.get(images[p]);
	};
	console.trace();
})