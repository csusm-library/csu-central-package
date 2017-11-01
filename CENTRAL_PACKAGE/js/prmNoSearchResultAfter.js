/**
 * Display facet to search Primo Central results if no results were found
 */

app.controller('prmNoSearchResultAfterController', ['$location', '$element', function($location, $element) {
    /**
     * Determine if the pcAvailability parameter is already set
     */
	this.pcAvailability = ($location.search().pcAvailability === "true" || $location.search().pcAvailability === true) ? true : false;

    /**
     * The value that was searched
     */
	this.term = this.parentCtrl.term;

    /**
     * Change pcAvailability parameter
     */
	this.changePcAvailability = function () {
		$location.search("pcAvailability", (this.pcAvailability ? true : false));
	};
}]);

app.component('prmNoSearchResultAfter', {
	bindings: {
		parentCtrl: '<'
	},
	controller: 'prmNoSearchResultAfterController',
	templateUrl: 'custom/CENTRAL_PACKAGE/html/prmNoSearchResultAfter.html'
});

