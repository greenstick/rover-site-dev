$(function () {
	var resize = function (e) {
		var resize;
		clearTimeout(resize);
		resize = setTimeout(function () {
			var height = e.currentTarget.innerHeight;
			$('body').height(height);
			timelineVM.resizeScrollbar();
			timelineVM.constrainArticleSize();
		}, 200);
	};

	$(window).on("resize", resize);
	$(window).load(resize);

	var TimelineViewmodel = function () {
		var self = this;

		self.isVisible = ko.observable(false);
		self.isLoaded = ko.observable(false);
		self.dataURL = "js/timeline-data.json";
		self.scrollbarWidth = ko.observable("20%");
		self.articleHeight = ko.observable("500px");
		self.offset = ko.observable(1/12*100);
		self.canScrollRight = ko.observable(true);
		self.canScrollLeft = ko.observable(false);

		self.years = ko.observableArray([
			{ name : '2015', location : remapValue(5, 0, 100, 8.25, 91.75) },
			{ name : '2020', location : remapValue(30, 0, 100, 8.25, 91.75) },
			{ name : '2025', location : remapValue(55, 0, 100, 8.25, 91.75) },
			{ name : '2030', location : remapValue(80, 0, 100, 8.25, 91.75) }
		]);

		self.topics = ko.observableArray([
			{ name : 'U.S. Economy' },
			{ name : 'Environment' },
			{ name : 'Public Health' },
			{ name : 'Global Economy' },
			{ name : 'Geopolitics' }
		]);
		self.activeTopic = ko.observable(null);
		
		self.articles = ko.observableArray([]);
		self.activeArticle = ko.observable(null);
		self.hoverArticle = ko.observable(null);
		
		self.filteredArticles = ko.computed(function () {
			if(self.activeTopic() !== null) {
				var filteredArray = [];
				for(var i = 0; i < self.articles().length; i++) {
					if(self.articles()[i].topic === self.activeTopic().name) {
						filteredArray.push(self.articles()[i]);
					}
				}
				self.activeArticle(filteredArray[0]);
				return filteredArray;
			}
			else {
				return self.articles();
			}
		}, this);

		self.updateArrowVisibility = function () {
			var $bar = $("#timeline-drag-bar");
			if($bar.position().left <= 0) {
				self.canScrollLeft(false);
				self.canScrollRight(true);	
			}
			else if($bar.position().left + $bar.width() >= $bar.parent().width()) {
				self.canScrollLeft(true);
				self.canScrollRight(false);	
			}
			else {
				self.canScrollLeft(true);
				self.canScrollRight(true);	
			}
		};

		self.centerTimeline = function () {
			var $bar = $("#timeline-drag-bar");
			var $timeline = $("#timeline-scrubber-container");
			var position = (self.activeArticle().remappedLocation/100) * $timeline.width();
			position = position - $("#timeline-scrubber-mask").width()/2;
			$bar.stop().animate({ 'left': (position * $bar.parent().width()/$timeline.width()) + "px"}, 250, self.updateArrowVisibility);
			$timeline.stop().animate({ 'left': "-" + position + "px"}, 250);
		};

		self.recenter = ko.computed(function () {
			if(self.activeTopic()) {
				var $bar = $("#timeline-drag-bar");
				var $timeline = $("#timeline-scrubber-container");
				var position = (self.activeArticle().remappedLocation/100) * $timeline.width();
				position = position - $("#timeline-scrubber-mask").width()/2;
				$bar.stop().animate({ 'left': (position * $bar.parent().width()/$timeline.width()) + "px"}, 250, self.updateArrowVisibility);
				$timeline.stop().animate({ 'left': "-" + position + "px"}, 250);
				return true;
			}
			return false;
		}, this);

		self.hasPreviousArticle = ko.computed(function () {
			return self.filteredArticles().indexOf(self.activeArticle()) > 0;
		}, this);

		self.hasNextArticle = ko.computed(function () {
			return self.filteredArticles().indexOf(self.activeArticle()) < self.filteredArticles().length-1;
		}, this);

		self.init = function () {
			self.isVisible(true);
			$("#load-screen").removeClass("done");
			if(self.isLoaded()) {
				self.activeTopic(null);
				self.activeArticle(self.articles()[0]);
			}
			else {
				var jsonRequest = $.getJSON(self.dataURL, self.loadData);
			}
			timelineVM.resizeScrollbar();
		};

		self.preloadImages = function (data) {
			var imagesLoaded = [];
			for(var i = 0; i < data.length; i++) {
				var tmp = new Image();
				tmp.src = "img/timeline-interactive/articles/" + data[i]['Filename'];
				imagesLoaded.push($(tmp).load());
			}
				
			return $.when(imagesLoaded);
		};

		self.loadData = function (data) {
			for(var i = 0; i < data.length; i++) {
				self.articles.push(new Article(data[i], self));
			}
			self.activeArticle(self.articles()[0]);
			self.isLoaded(true);

			self.preloadImages(data).done(function () {
				$("#load-screen").addClass("done");
			});
		};

		self.close = function () {
			self.isVisible(false);
		};

		self.previousArticle = function () {
			var index = self.filteredArticles().indexOf(self.activeArticle());
			if(index <= 0) {
				return false;
			}
			self.activeArticle(self.filteredArticles()[index-1]);
			self.centerTimeline();
		};

		self.nextArticle = function () {
			var index = self.filteredArticles().indexOf(self.activeArticle());
			if(index >= (self.filteredArticles().length - 1)) {
				return false;
			}
			self.activeArticle(self.filteredArticles()[index+1]);
			self.centerTimeline();
		};

		self.setArticle = function (data, event) {
			self.activeArticle(data);
			if(self.activeTopic() !== null && self.activeTopic().name !== data.topic) {
				self.activeTopic(null);
			}
			self.centerTimeline();
		};

		self.setTopic = function (data, event) {
			if(self.activeTopic() === data) {
				self.activeTopic(null);
			}
			else {
				self.activeTopic(data);
			}
		};

		self.updateTimelinePosition = function () {
			var $bar = $("#timeline-drag-bar");
			var left = ($bar.position().left * $("#timeline-scrubber-container").width() / $bar.parent().width());
			$("#timeline-scrubber-container").css('left', "-" + left + "px");
			if(left <= 0) {
				self.canScrollLeft(false);
				self.canScrollRight(true);	
			}
			else if($bar.position().left + $bar.width() >= $bar.parent().width()) {
				self.canScrollLeft(true);
				self.canScrollRight(false);	
			}
			else {
				self.canScrollLeft(true);
				self.canScrollRight(true);	
			}
		};

		self.scrollLeft = function () {
			var $bar = $("#timeline-drag-bar");
			var newLeft = ($bar.position().left - $bar.parent().width()*0.1);
			if(newLeft < 0) {
				newLeft = 0;
				self.canScrollLeft(false);
			}
			else {
				self.canScrollLeft(true);
			}
			self.canScrollRight(true);			
			$bar.stop().animate({ 'left': newLeft + "px"}, 250);
			var left = newLeft * $("#timeline-scrubber-container").width() / $bar.parent().width();
			$("#timeline-scrubber-container").stop().animate({ 'left': "-" + left + "px"}, 250);
		};

		self.scrollRight = function () {
			var $bar = $("#timeline-drag-bar");
			var newLeft = ($bar.position().left + $bar.parent().width()*0.1);
			if((newLeft + $bar.width()) > $bar.parent().width()) {
				newLeft = $bar.parent().width() - $bar.width();
				self.canScrollRight(false);
			}
			else {
				self.canScrollRight(true);
			}
			self.canScrollLeft(true);
			$bar.stop().animate({ 'left': newLeft + "px"}, 250);
			var left = newLeft * $("#timeline-scrubber-container").width() / $bar.parent().width();
			$("#timeline-scrubber-container").stop().animate({ 'left': "-" + left + "px"}, 250);
		};

		self.resizeScrollbar = function () {
			var maskWidth = $("#timeline-scrubber-mask").width();
			var timelineWidth = $("#timeline-scrubber-container").width();
			var scrollbarContainerWidth = $("#timeline-scrollbar").width();
			self.scrollbarWidth(((maskWidth/timelineWidth)*scrollbarContainerWidth) + "px");
		};

		self.setHoverArticle = function (data, event) {
			self.hoverArticle(data);
		};

		self.clearHoverArticle = function () {
			self.hoverArticle(null);
		};

		self.constrainArticleSize = function () {
			var height = $(window).height() - 200;
			self.articleHeight(height + "px");
		}; 

		self.animateArticleIn = function (element) {
			$(element).removeClass('animated fadeInDown');
			$(element).addClass('animated fadeInDown');
		};
	};

	function remapValue(x, a, b, c, d) {
	    if(a == b) { 
	        return x >= b ? d : c;
	    }
	    return (c + (d - c) * (x - a) / (b - a));
	}

	var Article = function (data, vm) {
		var article = this;
		article.headline = data["Headline"];
		article.topic = data["Topic"];
		article.location = data["Location"];
		article.remappedLocation = remapValue(data["Location"], 0, 100, 8.25, 91.75);
		article.filename = "img/timeline-interactive/articles/" + data["Filename"];
	};

	var timelineVM = new TimelineViewmodel();
	ko.applyBindings(timelineVM, $("#timeline")[0]);
});
