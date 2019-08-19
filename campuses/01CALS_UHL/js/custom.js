(function() {
	"use strict";
	'use strict';


	var app = angular.module('viewCustom', ['angularLoad']);

	/****************************************************************************************************/

	/*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

	/*var app = angular.module('centralCustom', ['angularLoad']);*/

	/****************************************************************************************************/
    


	app.controller('prmLogoAfterController', [function() {
		this.getIconLink = function() {
			return this.parentCtrl.iconLink;
		}
	}]);

	app.component('prmLogoAfter', {
		bindings: {
			parentCtrl: '<'
		},
		controller: 'prmLogoAfterController',
		template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.csueastbay.edu/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
	});
    
     /* StackMap: Start */
   app.component('prmSearchBarAfter', {
        template: `<div id="stackmap-cssloader">
            <link type="text/css" rel="Stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link type="text/css" rel="Stylesheet" href="https://www.stackmap.com/integration/csueastbay-angular/StackMap.css">
        </div>`,
        controller: 'FullViewAfterController'
    });
    app.controller('FullViewAfterController', ['angularLoad', function (angularLoad) {
        var vm = this;
         vm.$onInit = function () {
            angularLoad.loadScript('https://www.stackmap.com/integration/csueastbay-angular/StackMap.js')
        };
    }]);
    /* StackMap: END */

//add Show Results for
app.component('prmFacetAfter', {
    controller: function($location) {

	/* Construct query strings and parameters */
	var path = $location.absUrl().split('?')[0];
	var searchTerm = $location.search().query.split(',')[2];
	var query = $location.search().query;
    	var tab = '&tab=books_csu';
	var scope = '&search_scope=01CALS';
	var sort = $location.search().sortby;
	var rest = '&vid=01CALS_UHL&lang=en_US&offset=0';

	/* Populate variables and links */
	var csulink = path+'?query='+query+tab+scope+'&sortby='+sort+rest;


	/* Output -Show Results for- output */
        angular.element(document).ready(function () {
           var eNode = angular.element(document.querySelectorAll("prm-facet .sidebar-inner-wrapper"));
           if (eNode != null && eNode != undefined){
		eNode.prepend("<div tabindex='-1' ng-if='$ctrl.totalResults > 1 || $ctrl.isFiltered()' class='sidebar-section compensate-padding-left'><h2 class='sidebar-title' >Show Results for</h2></div><div tabindex='-1' class='sidebar-section margin-top-small margin-bottom-medium compensate-padding-left'><div class='layout-row margin-bottom-small bold-text'><a href='"+csulink+"' target='_blank' title='California State University'>All CSU+ Collections</a></div></div>");
           }
        });

	/* hide Expand More Results  */
    var vm = this;
	vm.parentCtrl.showPcAvailability = false;

     }
});

app.component('prmActionListAfter', {
    controller: function($location) {

	/* Construct query strings and parameters */
	var recordpath = $location.absUrl();
	var report ="https://library.csueastbay.edu/aboutthelibraries/contact-us/report-a-problem";
	var problink = report+'?'+recordpath;

	/* Output -Report a Problem and Ask a Librarian- output */
        angular.element(document).ready(function () {
           var prob = angular.element(document.querySelectorAll("prm-action-list-after"));
           if (prob != null && prob != undefined){
		prob.prepend("<h2>Additional Services</h2><a href='http://library.csueastbay.edu/usingthelibraries/ask-us' target='_blank' title='Ask a Librarian'>Ask a Librarian</a><br/><a href='"+problink+"' target='_blank' title='Report a Problem'>Report a Problem</a>");
              
           }
        });


     }
});

})();

/* StackMap: Start */
(function(){

    var a = document.querySelector("head");
    var css1 = document.createElement("link"); 
    css1.type = "text/css";
    css1.rel = "Stylesheet";
    css1.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
    css1.crossorigin = "anonymous";
    a.appendChild(css1);

    var css2 = document.createElement("link"); 
    css2.type = "text/css";
    css2.rel = "Stylesheet";
    css2.href = "https://www.stackmap.com/integration/csueastbay-angular/StackMap.css";
    a.appendChild(css2);

    var w = document.createElement("script"); 
    w.type = "text/javascript"; w.async = true;
    w.src = "https://www.stackmap.com/integration/csueastbay-angular/StackMap.js";
    var b = document.body;
    b.appendChild(w);

})();
/* StackMap: END */