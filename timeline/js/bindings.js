ko.bindingHandlers.opacity = {
	update : function (element, valueAccessor) {
		if(ko.unwrap(valueAccessor()))
			$(element).addClass('visible');      
		else
			$(element).removeClass('visible');
    }
};

ko.bindingHandlers.draggable = {
	init : function (element, valueAccessor) {
		$(element).draggable({
			drag: valueAccessor(),
			containment: "parent",
			axis: "x"
		});      
    },
	update : function (element, valueAccessor) {
		
    }
};

ko.bindingHandlers.headline = {
	init : function (element, valueAccessor) {
		var value = valueAccessor();
		if (value.indexOf('<br />') !== -1 ) {
			var newValue = value.replace('<br />', '<div class="subheadline">') + "</div>";
			$(element).html(newValue);
		}
		else {
			$(element).html(value);
		}
    },
	update : function (element, valueAccessor) {
		var value = valueAccessor();
		if (value.indexOf('<br />') !== -1 ) {
			var newValue = value.replace('<br />', '<div class="subheadline">') + "</div>";
			$(element).html(newValue);
		}
		else {
			$(element).html(value);
		}
    }
};

ko.bindingHandlers.displayArticle = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        // // Make a modified binding context, with a extra properties, and apply it to descendant elements
        // var childBindingContext = bindingContext.createChildContext(
        //     bindingContext.$rawData, 
        //     null, // Optionally, pass a string here as an alias for the data item in descendant contexts
        //     function(context) {
        //         ko.utils.extend(context, valueAccessor());
        //     });
        // ko.applyBindingsToDescendants(childBindingContext, element);
 
        // // Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
        // return { controlsDescendantBindings: true };

        // Make a modified binding context, with a extra properties, and apply it to descendant elements
        var innerBindingContext = bindingContext.extend(valueAccessor);
        ko.applyBindingsToDescendants(innerBindingContext, element);
 
        // Also tell KO *not* to bind the descendants itself, otherwise they will be bound twice
        return { controlsDescendantBindings: true };
    }
};

ko.bindingHandlers.timelineArticle = {
	init : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var data = valueAccessor();
		var vm = bindingContext.$parent;
		var classes = "";
		if(vm.activeArticle() === data) {
			classes += "highlight";
		}
		if(vm.activeTopic() !== null && vm.activeTopic().name !== data.topic) {
			classes += "blip";
		}
		$(element).addClass(classes);      
    },
	update : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var data = valueAccessor();
		var vm = bindingContext.$parent;
		var classes = "";
		if(vm.activeArticle() === data) {
			classes += "highlight";
		}
		if(vm.activeTopic() !== null && vm.activeTopic().name !== data.topic) {
			classes += "blip";
		}
		$(element).removeClass("highlight blip").addClass(classes);
    }
};

ko.bindingHandlers.articleScroll = {
	init : function (element, valueAccessor, allBindings, viewModel, bindingContext) {
		var delta, scrolling = false;

		$(element).on('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {
			scrollDelta(e);
		});

		function scrollDelta (e) {
			delta = 0;
			if (!e) e = window.event;
			if (e.originalEvent.wheelDelta) {
				delta = e.originalEvent.wheelDelta / 120;
			} else if (e.originalEvent.detail) {
				delta = - e.originalEvent.detail / 3;
			};
			if (delta) {
				e.preventDefault ? e.preventDefault() : e.returnValue = false;
				scrollDirection();
			};
		};

		function scrollDirection () {
			// if (this.scrolling === false) {
				if (delta < -0.5) {
					// this.scrolling = true;
					// this.scrollPage('next');
					viewModel.nextArticle();
				} else  if (delta > 0.5) {
					// this.scrolling = true;
					// this.scrollPage('prev');
					viewModel.previousArticle();
				};
			// };
		};
    }
};



