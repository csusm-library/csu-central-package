(function(){
"use strict";
'use strict';

/* BEGIN custom.module.js */
var app = angular.module('viewCustom', ['angularLoad']);
/* END custom.module.js */

/* BEGIN primo-explore-calpoly-clickable-logo.js */
// Add Clickable Logo
app.controller('prmLogoAfterController', [function () {
  var vm = this;
  vm.getIconLink = getIconLink;

  function getIconLink() {
    return vm.parentCtrl.iconLink;
  }
}]);

app.component('prmLogoAfter', {
  bindings: { parentCtrl: '<' },
  controller: 'prmLogoAfterController',
  template: '' + '<div class="product-logo product-logo-local" ' + '     layout="row" layout-align="start center" layout-fill id="banner">' + '  <a ng-href={{"nui.header.LogoUrl"|translate}}>' + '     <img class="logo-image"' + '      alt={{"nui.header.LogoAlt"|translate}}' + '      ng-src="{{$ctrl.getIconLink()}}"/>' + '  </a>' + '</div>'
});
/* END primo-explore-calpoly-clickable-logo.js */
})();