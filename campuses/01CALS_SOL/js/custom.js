(function() {
  "use strict";
  'use strict';


var app = angular.module('viewCustom', ['sendSms','reportProblem','multipleAnalytics','angularLoad']);

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/
  
  //Begin sendSMS module code
app.constant('smsOptions', {
  enabled: true
});
  	
  	//Begin reportProblem module code
  app.constant('reportProblem', {
  to: 'laura.krier@sonoma.edu',
  enabled: true
});
  
  //Begin multipleAnalytics code
app.constant('analyticsOptions', {
  enabled: true,
  siteSource: 'ga',
  siteId: 'UA-420393-22',
  siteUrl: 'https://www.google-analytics.com/analytics.js',
  defaultTitle: 'OneSearch'
});
  
  // Begin BrowZine - Primo Integration...
  window.browzine = {
    api: "https://public-api.thirdiron.com/public/v1/libraries/517",
    apiKey: "71bc1f07-b28f-4cfc-a0a3-8e34c10035ec",
    primoJournalBrowZineWebLinkText: "View Journal Contents",
    primoArticleBrowZineWebLinkText: "View Issue Contents",
  };
 
  browzine.script = document.createElement("script");
  browzine.script.src = "https://s3.amazonaws.com/browzine-adapters/primo/browzine-primo-adapter.js";
  document.head.appendChild(browzine.script);
 
  app.controller('prmSearchResultAvailabilityLineAfterController', function($scope) {
    window.browzine.primo.searchResult($scope);
  });
 
  app.component('prmSearchResultAvailabilityLineAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmSearchResultAvailabilityLineAfterController'
  });
// ... End BrowZine - Primo Integration

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
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.sonoma.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

})();
