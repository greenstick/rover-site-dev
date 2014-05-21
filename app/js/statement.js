to = function (parent, element, blurb, easing, duration) {
	$(parent).scrollTo(element, {
		duration: duration,
		axis: "x"
	});
	// $(blurb).scrollTo(blurbPos, {
	// 	duration: duration,
	// 	easing: easing,
	// 	axis: "x"
	// });
};
$("#statement1 .next").on("click", function () {
	to('#statement', '#statement2', '#statement1 .blurb', 'easeOutCirc', 800);
});
$('#statement2 .next').on("click", function () {
	to('#statement', '#statement3', '#statement2 .blurb', 'easeOutCirc', 800);
});
$('#statement2 .prev').on("click", function () {
	to('#statement', '#statement1', '#statement2 .blurb', 'easeOutCirc', 800);
});
$("#statement3 .prev").on("click", function () {
	to('#statement', '#statement2', '#statement3 .blurb', 'easeOutCirc', 800);
});


resizeIt = function (e) {
	var height = e.currentTarget.innerHeight;
	var width = e.currentTarget.innerWidth;
		$('body').height(height);
		$('.subPage').width(width);
};

//Resize
$(window).on("resize", function (e) {
	var resize;
	clearTimeout(resize);
	resize = setTimeout(function () {
		resizeIt(e);
	}, 200);
});
$(window).load(function (e) {
	resizeIt(e);
});