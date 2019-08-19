(function() {
  "use strict";
  'use strict';


  var app = angular.module('viewCustom', ['angularLoad']);

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/

  app.controller('prmLogoAfterController', [function() {
    var vm = this;
    vm.getIconLink = getIconLink;

    function getIconLink() {
      return vm.parentCtrl.iconLink;
    }
  }]);

  app.component('prmLogoAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.csum.edu/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

/* add Show Results for */
app.component('prmFacetAfter', {
	bindings: {
		        parentCtrl: '<'
    },

    controller: function($location) {
	var path = $location.absUrl().split('?')[0];
	var searchTerm = $location.search().query.split(',')[2];
	var query = $location.search().query;
        var tab = '&tab=default_tab';
	var scope = '&search_scope=01CALS';
	var sort = $location.search().sortby;
	var rest = '&vid=01CALS_MAL&lang=en_US&offset=0';
	var csulink = path+'?query='+query+tab+scope+'&sortby='+sort+rest;

        angular.element(document).ready(function () {
           var eNode = angular.element(document.querySelectorAll("prm-facet .sidebar-inner-wrapper"));
           if (eNode != null && eNode != undefined){
		eNode.prepend("<div tabindex='-1' ng-if='$ctrl.totalResults > 1 || $ctrl.isFiltered()' class='sidebar-section compensate-padding-left'><h2 class='sidebar-title' >Search Books & Media at other CSU libraries:</h2><div tabindex='-1' class='sidebar-section margin-top-small margin-bottom-medium compensate-padding-left'><div class='layout-row margin-bottom-small bold-text'><a href='"+csulink+"' target='_blank' title='California State University (CSU+)'>California State University (CSU+)</a></div></div></div>");
                //console.log(eNode.text());
           }

	   });
	var vm = this;
	vm.parentCtrl.showPcAvailability = false;


     }
});


})();


