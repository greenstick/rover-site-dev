/*
Zip Code Modal View Model
*/

var Zipcode = function (element) {
	var zip = this;
		zip.element = selement,
		zip.zipcode = ko.observable();
};

//Open Zipcode Modal
Zipcode.prototype.open	=	function () {
	var zip = this;
	$(zip.element).fadeIn();
};

//Close Zipcode Modal
Zipcode.prototype.close = function () {
	$(zip.element).fadeOut();
};

//Instantiation
var zipModal = new Zipcode("#zipcode-modal");

//Apply Knockout Bindings
ko.applyBindings(zipModal, document.getElementById("zipcode-modal"));

/*
Event Bindings
*/

//Open Modal
$('#zip-open').on("click", function () {
	zipModal.open();
});

//Close Modal
$('#zipcode-modal .close').on("click", function () {
	zipModal.close();
});