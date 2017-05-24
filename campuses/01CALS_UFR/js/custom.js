(function(){
"use strict";
'use strict';

/* START: app.js */

var app = angular.module('viewCustom', ['angularLoad']);

/* END: app.js */

/* START: central-pkg.js */

/**
 * resolve duplicate source codes
 * takes first source code instance and removes additional characters
 */
app.controller('prmServiceDetailsAfterController', [function () {

  this.getKillCodeLink = function () {

    // primo central record
    if (this.parentCtrl.item.context == "PC") {
      return this.parentCtrl.item.pnx.display.source[0];
    }

    // alma records; show only first, sans identifier code
    return this.parentCtrl.item.pnx.display.source[0].replace(/\$\$V/g, "").replace(/\$\$O01CALS_ALMA/g, '').replace(/[0-9]/g, '');
  };
}]);

app.component('prmServiceDetailsAfter', {
  bindings: { parentCtrl: '<' },
  controller: 'prmServiceDetailsAfterController',
  template: '<div layout="row" layout-xs="column" class="layout-block-xs layout-xs-column layout-row"><div flex-gt-sm="20" flex-gt-xs="25" class="flex-gt-xs-25 flex-gt-sm-20 flex"><span class="bold-text" title="Source">Source</span></div><div flex="" class="flex"><div><div layout="column" class="spaced-rows word-break layout-column">{{$ctrl.getKillCodeLink()}}</div></div></div></div>'
});

/* END: central-pkg.js */

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

/* START: other-mods.js */

// Write message below search box
/*app.component('prmSearchBarAfter', {
  template: '<span><br>Modifying the Central Package!</span>'
});*/

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
    var csuServiceName = 'CSU+';
    var csuServiceNote = 'All CSU Campus Libraries';
    var libLink = 'https://sjvls.ent.sirsi.net/client/en_US/fhq/search/results?qu=' + searchTerm + '&te=';
    var libName = 'Fresno County Library';
    var sectionTitle = 'Borrow from Other Libraries:';

    /* Create HTML output */
    /*var rowOne = "<div class='layout-row margin-bottom-small bold-text'><a href='" + libLink + "' target='_blank' title='" + libName + "'>" + libName + "</a></div>";*/
    var rowOne = "";
    var rowTwo = "<div class='layout-row margin-bottom-small bold-text'><a href='" + csuLink + "' target='_blank' title='" + csuServiceNote + "'>" + csuServiceName + "</a></div>";

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