(function() {
  "use strict";
  'use strict';

  var app = angular.module('viewCustom', ['sendSms','reportProblem','multipleAnalytics', 'angularLoad']);

    app.constant('smsOptions', {
      enabled: true,
      index: 5,
      label: 'SMS'
    });

  app.constant('reportProblem', {
    to: 'davidwalker126+n5r6m2xtcdeeprctegdt@boards.trello.com',
    enabled: true,
    messageText: 'This better work',
    format: 'markdown'
  });

  app.constant('analyticsOptions', {
    enabled: true,
    siteSource: 'ga',
    siteId: 'UA-49482225-3',
    siteUrl: 'https://www.google-analytics.com/analytics.js',
    defaultTitle: 'OneSearch'
  });

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
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="https://www.csulb.edu/library/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

  //add libchat box
  var s=document.createElement('script');
  s.id='localScript';
  s.src='//v2.libanswers.com/load_chat.php?hash=20578764db325563b7d0916b60282165';
  document.body.appendChild(s);
  var d=document.createElement('div');
  d.id='libchat_20578764db325563b7d0916b60282165';
  document.body.appendChild(d);

})();
