(function() {
  "use strict";
  'use strict';


var app = angular.module('viewCustom', ['angularLoad']);

/*---------------------------Begin WorldCat Code----------------------------------------*/
/*-- adapted from https://github.com/SarahZum/primo-explore-custom-no-results --*/
	app.controller('prmNoSearchResultAfterController', [function () {
		var vm = this;
		vm.getSearchTerm = getSearchTerm;
		function getSearchTerm() {
 			return vm.parentCtrl.term;
 		}
	}]);

	app.component('prmNoSearchResultAfter',{
		bindings: {parentCtrl: '<'},
		controller: 'prmNoSearchResultAfterController',
		template: `<md-card class="default-card zero-margin _md md-primoExplore-theme">
					<md-card-title>
						<md-card-title-text>
							<span translate="" class="md-headline ng-scope">No records found</span>
						</md-card-title-text>
					</md-card-title>
					<md-card-content>


						<p>
						<span>There are no results matching your search:
						<blockquote><em>{{$ctrl.getSearchTerm()}}</em></blockquote></span>
						</p>
						<p><span translate="" class="bold-text ng-scope">Suggestions:</span></p>
						<ul><li translate="" class="ng-scope">Make sure that all words are spelled correctly.</li>
						<li translate="" class="ng-scope">Try more general search terms.</li>
						<li translate="" class="ng-scope">Try fewer search terms.</li>
						</ul>
						<!-- Other helpful links -->
						<p><span translate="" class="bold-text ng-scope">Look Elsewhere:</span></p>
						<ul>
						<li><a href="https://sdsu-primo.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,{{$ctrl.getSearchTerm()}},AND&tab=books_csu&search_scope=01CALS&sortby=rank&vid=01CALS_SDL&lang=en_US&mode=advanced&offset=0" target="_blank">Trying a book search? Look in other <span class="bold-text">California State University Libraries</span></a></li>
						<li><a href="https://circuit.sdsu.edu/search~S0/X?{{$ctrl.getSearchTerm()}}&SORT=D" target="_blank">Request it from local libraries through <span class="bold-text">San Diego Circuit</span></a></li>
						<li><a href="https://sandiegostate.on.worldcat.org/search?queryString=kw:{{$ctrl.getSearchTerm()}}&databaseList=283" target="_blank">Search <span class="bold-text">WorldCat</span></a></li>
						<li><a href="http://library.sdsu.edu/borrowing/borrowing-other-libraries" target="_blank">Looking for a known item? Request it through <span class="bold-text">InterLibrary Loan</span></a></li>
						<li><a href="http://library.sdsu.edu/help-services/ask-librarian" target="_blank"><span class="bold-text">Contact a research librarian</span> for assistance</a></li>

					</md-card-content>
				   </md-card>`
	});
/*---------------------------End WorldCat Code----------------------------------------*/

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


  //update template to include new URL for institution
  app.component('prmLogoAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.sdsu.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

})();
