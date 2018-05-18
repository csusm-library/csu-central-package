(function(){
"use strict";
'use strict';

/* START: app.js */

var app = angular.module('viewCustom', ['angularLoad']);

/* END: app.js */

// Begin BrowZine - Primo Integration ...
window.browzine = {
  api: "https://api.thirdiron.com/public/v1/libraries/815",
  apiKey: "f6ce703a-274c-43e8-932b-5bfa87700784",
  primoJournalBrowZineWebLinkText: "View Journal",
  primoArticleBrowZineWebLinkText: "View this issue"
};

browzine.script = document.createElement("script");
browzine.script.src = "https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js";
document.head.appendChild(browzine.script);
// End BrowZine - Primo Integration


/* The central-pkg.js is purposely empty. */

/**
 * Add Google Analytics tracking code snippet.
 */
app.controller('prmExploreMainAfterController', ['$scope', function ($scope) {
  /**
   * On page load, init
   */
  this.$onInit = function () {
    /* $scope.showLibs = false; */
  };
}]);

app.component('prmExploreMainAfter', {
  bindings: { parentCtrl: '<' },
  controller: 'prmExploreMainAfterController',
  templateUrl: 'custom/01CALS_UFR/html/prmExploreMainAfter.html'
});

/* START: institutional-logo.js */

// Include institutional URL
app.controller('prmLogoAfterController', [function () {
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
  template: '<div class="product-logo product-logo-local fresno-logo" layout="row" layout-align="start center" layout-fill id="banner"><a href="https://library.fresnostate.edu/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
});

/* END: institutional-logo.js */

/* START: no-results.js */

// Enhance No Results tile, per https://github.com/SarahZum/primo-explore-custom-no-results

app.controller('prmNoSearchResultAfterController', [function () {
  var vm = this;
  vm.getSearchTerm = getSearchTerm;
  function getSearchTerm() {
    return vm.parentCtrl.term;
  }

  vm.getVid = getVid;
  function getVid() {
    return '01CALS_UFR';
  }
}]);

app.component('prmNoSearchResultAfter', {
  bindings: { parentCtrl: '<' },
  controller: 'prmNoSearchResultAfterController',
  templateUrl: 'custom/01CALS_UFR/html/prmNoSearchResultAfter.html'
});

/* END: no-results.js */

/* START: other-altmetrics.js */

// Add Altmetrics to side-bar
// Per https://developers.exlibrisgroup.com/blog/Adding-Altmetrics-to-your-Primo-Full-Record-Display
app.controller('FullViewAfterController', ['angularLoad', '$http', '$scope', '$element', '$timeout', '$window', function (angularLoad, $http, $scope, $element, $timeout, $window) {
  var vm = this;
  this.$http = $http;
  this.$element = $element;
  this.$scope = $scope;
  this.$window = $window;

  vm.$onInit = function () //wait for all the bindings to be initialised
  {

    vm.parentElement = this.$element.parent()[0]; //the prm-full-view container

    try {
      vm.doi = vm.parentCtrl.item.pnx.addata.doi[0] || '';
    } catch (e) {
      return;
    }

    if (vm.doi) {
      //If we've got a doi to work with check whether altmetrics has data for it.
      //If so, make our div visible and create a new Altmetrics service
      $timeout(function () {
        $http.get('https://api.altmetric.com/v1/doi/' + vm.doi).then(function () {
          try {
            //Get the altmetrics widget
            angularLoad.loadScript('https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js?' + Date.now()).then(function () {});
            //Create our new Primo service
            var altmetricsSection = {
              scrollId: "altmetrics",
              serviceName: "altmetrics",
              title: "brief.results.tabs.Altmetrics"
            };
            vm.parentCtrl.services.splice(vm.parentCtrl.services.length, 0, altmetricsSection);
          } catch (e) {
            console.log(e);
          }
        }).catch(function (e) {
          return;
        });
      }, 3000);
    }

    //move the altmetrics widget into the new Altmetrics service section
    var unbindWatcher = this.$scope.$watch(function () {
      return vm.parentElement.querySelector('h4[translate="brief.results.tabs.Altmetrics"]');
    }, function (newVal, oldVal) {
      if (newVal) {
        //Get the section body associated with the value we're watching
        var altContainer = newVal.parentElement.parentElement.parentElement.parentElement.children[1];
        var almt1 = vm.parentElement.children[1].children[0];
        if (altContainer && altContainer.appendChild && altm1) {
          altContainer.appendChild(altm1);
        }
        unbindWatcher();
      }
    });
  }; // end of $onInit


  //You'd also need to look at removing the various css/js scripts loaded by this.
  //refer to: https://github.com/Det-Kongelige-Bibliotek/primo-explore-rex
  vm.$onDestroy = function () {
    if (this.$window._altmetric) {
      delete this.$window._altmetric;
    }

    if (this.$window._altmetric_embed_init) {
      delete this.$window._altmetric_embed_init;
    }

    if (this.$window.AltmetricTemplates) {
      delete this.$window.AltmetricTemplates;
    }
  };
}]);

app.component('prmFullViewAfter', {
  bindings: { parentCtrl: '<' },
  controller: 'FullViewAfterController',
  template: '<div id="altm1" ng-if="$ctrl.doi" class="altmetric-embed" data-hide-no-mentions="true"  data-link-target="new" data-badge-type="medium-donut" data-badge-details="right" data-doi="{{$ctrl.doi}}"></div>'
});

/* END: other-altmetrics.js */

/* START: other-browzine.js */

// Load BrowZine Adapter
window.browzine = {
  api: "https://public-api.thirdiron.com/public/v1/libraries/815",
  apiKey: "f6ce703a-274c-43e8-932b-5bfa87700784",
  primoJournalBrowZineWebLinkText: "View Journal",
  primoArticleBrowZineWebLinkText: ""
};

browzine.script = document.createElement("script");
browzine.script.src = "https://library.fresnostate.edu/sites/all/assets/src/js/thirdiron/browzine-primo-adapter_modified.js";
document.head.appendChild(browzine.script);

// Add Journal Cover Image and Article In Context Link from BrowZine
// Guide: If this Primo controller/component combo already exists from another 3rd-party 
// integration, then do not create another combo. Simply update the existing controller with the
// `window.browzine.primo.searchResult($scope);` line and validate the `$scope` object is injected 
// into the controller `function($scope)` signature.
app.controller('prmSearchResultAvailabilityLineAfterController', function ($scope) {
  window.browzine.primo.searchResult($scope);
});

app.component('prmSearchResultAvailabilityLineAfter', {
  bindings: { parentCtrl: '<' },
  controller: 'prmSearchResultAvailabilityLineAfterController'
});

/* END: other-browzine.js */

/* START: other-mods.js */

// Add extra search links to side-bar
app.component('prmFacetAfter', {
  controller: function controller($location) {

    /* Construct query strings and parameters */
    var path = $location.absUrl().split('?')[0];
    var searchTerm = $location.search().query.split(',')[2];
    var query = $location.search().query;
    var tab = '&tab=default_tab';
    var scope = '&search_scope=01CALS';
    var sort = $location.search().sortby;
    var rest = '&vid=01CALS_UFR&lang=en_US&offset=0';

    /* Populate variables and links */
    var csuLink = path + '?query=' + query + tab + scope + '&sortby=' + sort + rest;
    var csuServiceName = 'CSU+ Resource Sharing';
    var csuServiceNote = 'All CSU Campus Libraries';
    var libLink = 'https://sjvls.ent.sirsi.net/client/en_US/fhq/search/results?qu=' + searchTerm + '&te=';
    var libName = 'Fresno County Library';
    var sectionTitle = 'Search Books & Media at other CSU libraries:';

    /* Create HTML output */
    /*var rowOne = "<div class='layout-row margin-bottom-small bold-text'><a href='" + libLink + "' target='_blank' title='" + libName + "'>" + libName + "</a></div>";*/
    var rowOne = "";
    //var rowTwo = "<div class='layout-row margin-bottom-small bold-text'><a href='" + csuLink + "' target='_blank' title='" + csuServiceNote + "'>" + csuServiceName + "</a></div>";
    var rowTwo = "<div class='layout-row margin-bottom-none'><a href='" + csuLink + "' target='_blank' title='" + csuServiceNote + "'><img src='https://library.fresnostate.edu/sites/all/assets/img/shared/csu-plus.png' alt='CSU+ Resource Sharing'></a></div>";

    /* Output the HTML */
    angular.element(document).ready(function () {
      var eNode = angular.element(document.querySelectorAll("prm-facet .sidebar-inner-wrapper"));
      if (eNode != null && eNode != undefined) {
        eNode.prepend("<div tabindex='-1' ng-if='$ctrl.totalResults > 1 || $ctrl.isFiltered()' class='sidebar-section compensate-padding-left'><h2 class='sidebar-title' >" + sectionTitle + "</h2></div><div tabindex='-1' class='sidebar-section margin-top-small margin-bottom-medium compensate-padding-left'>" + rowOne + " " + rowTwo + "</div>");
      }

      var rNode = angular.element(document.querySelectorAll("div[ng-if='$ctrl.showPcAvailability']"));
      if (rNode != null && eNode != undefined) {
        rNode.remove();
      }
    });
  }
});

/* END: other-mods.js */
})();