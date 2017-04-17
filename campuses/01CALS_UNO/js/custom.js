(function() {
  "use strict";

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


  //update template to include new URL for institution
  app.component('prmLogoAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.csun.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

// CSUN Customization - Resolve Duplicate Source Codes - Takes First Source Code instance and removes additional characters
  app.controller('prmServiceDetailsAfterController', [function () {
   var vm = this;
   vm.getKillCodeLink = getKillCodeLink;
 
    function getKillCodeLink() {
      return this.parentCtrl.item.pnx.display.source[0].replace(/\$\$V/g, "").replace(/\$\$O01CALS_ALMA/g, '').replace(/[0-9]/g, '');
      if (parentCtrl.item.context == "PC") {
        //Primo Central record; proxy candidate
      return this.parentCtrl.item.pnx.display.source[0]
      }
    }
 
  }]);
 
  app.component('prmServiceDetailsAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmServiceDetailsAfterController',
    template: '<div layout="row" layout-xs="column" class="layout-block-xs layout-xs-column layout-row"><div flex-gt-sm="20" flex-gt-xs="25"  class="flex-gt-xs-25 flex-gt-sm-20 flex"><span class="bold-text" title="Source">Source</span></div><div flex="" class="flex"><div><div layout="column" class="spaced-rows word-break layout-column">{{$ctrl.getKillCodeLink()}}</div></div></div></div>'
  });
//End Code



})();
