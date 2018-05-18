(function() {
  "use strict";
  'use strict';


  var app = angular.module('viewCustom', ['angularLoad']);

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/


})

var app = angular.module('viewCustom', ['angularLoad']);


  app.controller('prmLogoAfterController', [function() {
    var vm = this;
    vm.getIconLink = getIconLink;

    function getIconLink() {
      return vm.parentCtrl.iconLink;
    }
  }]);


  //update template to include new URL for institution
  app.component('prmLogoAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.sjsu.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });


//add a survey
var s=document.createElement('script');
s.id='localScript';
s.src='//v2.libanswers.com/load_chat.php?hash=3f859937ccdb788f9347ce781eb60049';
document.head.appendChild(s);


//add libchat box
/*var s=document.createElement('script');
s.id='localScript';
s.src='//v2.libanswers.com/load_chat.php?hash=342672b23c9e6bf0097c195190c83591';
document.body.appendChild(s);
*/

//add crazy egg script
var c=document.createElement('script');
c.id='localscript2';
c.src='//script.crazyegg.com/pages/scripts/0061/3590.js?'+Math.floor(new Date().getTime()/3600000);
c.async=true;
document.head.appendChild(c);


//add Show Results for
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
	var rest = '&vid=01CALS_SJO&lang=en_US&offset=0';
	var csulink = path+'?query='+query+tab+scope+'&sortby='+sort+rest;
	var sjplink = 'http://discover.sjlibrary.org/iii/encore/search/C__S'+searchTerm+'__Orightresult__U?lang=eng&suite=sjpl';
 	var crlink = 'http://reserves.calstate.edu/sanjose/';
	//console.log(sjplink);

        angular.element(document).ready(function () {
           var eNode = angular.element(document.querySelectorAll("prm-facet .sidebar-inner-wrapper"));
           if (eNode != null && eNode != undefined){
		eNode.prepend("<div tabindex='-1' ng-if='$ctrl.totalResults > 1 || $ctrl.isFiltered()' class='sidebar-section compensate-padding-left'><h2 class='sidebar-title' >Show Results for</h2></div><div tabindex='-1' class='sidebar-section margin-top-small margin-bottom-medium compensate-padding-left'><div class='layout-row margin-bottom-small bold-text'><a href='"+sjplink+"' target='_blank' title='San Jose Public Library'>San Jose Public Library</a></div><div class='layout-row margin-bottom-small bold-text'><a href='"+csulink+"' target='_blank' title='California State University (CSU+)'>California State University (CSU+)</a></div><div class='layout-row margin-bottom-small bold-text'><a href='"+crlink+"' target='_blank' title='Course Reserves'>Course Reserves</a></div></div>");
                //console.log(eNode.text());
           }

	   });
	var vm = this;
	vm.parentCtrl.showPcAvailability = false;


     }
});


//add pagination bar back to browse tag
app.component('prmBrowseSearchBarAfter', {
        bindings: {
          parentCtrl: '<'
        },
        template: '<style>prm-page-nav-menu { display: inline; }</style>'
});


//hide pagination on browse tag list result page
app.component('prmBackToSearchResultsButtonAfter', {
        bindings: {
          parentCtrl: '<'
        },
        template: '<style>prm-page-nav-menu { display: none; }</style>'
});


