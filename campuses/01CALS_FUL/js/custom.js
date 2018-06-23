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
  template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.fullerton.edu/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
});

//  app.component('prmSearchBarAfter',{
// 	bindings: {},
// 	template:`<div><span>Hello, World</span></div>`

// });




app.run(function ($rootScope, $location, $state, $stateParams) {
  $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
      if(fromState != toState && ga) {
          console.log("$locationChangeSuccess | event: ", event);
          console.log("$locationChangeSuccess | referrerUrl: ", fromState);
          console.log("$locationChangeSuccess | newUrl: ", toState);
          console.log("$locationChangeSuccess | document.title: ", document.title);
          // _paq.push(['setReferrerUrl', fromState]);
          // _paq.push(['setCustomUrl', toState]);
          // // not all pages update the title, just main and journal searches.
          // _paq.push(['setDocumentTitle', document.title]);

      /*
          // google analytics example, but simpler but possibly not as definitive  */
       ga('set', 'page', $location.url());
       ga('send', 'pageview');
 
        // alert( toState);
    
      }
  });
});

})();

//Google Analytics

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-5638015-14', 'auto');
ga('set', 'page', $location.url());
ga('send', 'pageview');

//End Google Analytics

//window.alert("Analytics Test Point 3");