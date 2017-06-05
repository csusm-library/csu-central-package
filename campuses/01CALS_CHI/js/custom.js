(function(){
"use strict";
'use strict';

var app = angular.module('viewCustom', ['angularLoad']);

/****************************************************************************************************/

/*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

/*var app = angular.module('centralCustom', ['angularLoad']);*/

/****************************************************************************************************/

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
  template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://www.csuchico.edu/library/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
});

app.component('prmTabsAndScopesSelectorAfter', {
  bindings: { parentCtrl: '<' },

  controller: function controller($scope) {
    setTimeout(function () {
      function activateSearch() {
        document.getElementsByClassName("zero-margin button-confirm md-button md-primoExplore-theme")[0].click();
      }
      var searchScopes = document.querySelectorAll('[id^="select_option_"]');
      for (var i in searchScopes) {
        searchScopes[i].onclick = function () {
          activateSearch();
        };
      }
    }, 500);
  }

});

//add libchat box
var s = document.createElement('script');
s.id = 'localScript';
s.src = '//libanswers.csuchico.edu/load_chat.php?hash=6981cfec21acf03fe702e000594ded4a&options=libchat_6981cfec21acf03fe702e000594ded4a';
document.body.appendChild(s);
})();