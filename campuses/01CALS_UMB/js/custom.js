(function() {
  "use strict";
  'use strict';


  var app = angular.module('viewCustom', ['sendSms','reportProblem','multipleAnalytics','angularLoad']);

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/

  app.constant('smsOptions', {
    enabled: true
  });

  app.constant('analyticsOptions', {
    enabled: true,
    siteSource: 'ga',
    siteId: 'UA-127216855-1',
    siteUrl: 'https://www.google-analytics.com/analytics.js',
    defaultTitle: 'OneSearch'
  });

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
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="https://csumb.edu/library"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });



})();
