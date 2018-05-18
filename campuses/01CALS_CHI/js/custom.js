(function(){
"use strict";
'use strict';

var app = angular.module('viewCustom', ['angularLoad']);
var app = angular.module('viewCustom', ['googleAnalytics']);

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
  template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.csuchico.edu/"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
});

/* submit search on scope change -- removed temporarily
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

 */

//add libchat box
// button color suggestion: #00906a
/* commented out until approved
  var s=document.createElement('script');
  s.id ='localScript';
  s.type = 'text/javascript';
  s.src = '//libanswers.csuchico.edu/load_chat.php?hash=c891f58327f8afd229975bf28509577b&options=libchat_c891f58327f8afd229975bf28509577b';
  document.getElementsByTagName('head')[0].appendChild(s);

  var d=document.createElement('div');
  d.id='libchat_c891f58327f8afd229975bf28509577b';
  document.body.appendChild(d);
*/

/* Begin Google Analytics code
 Credit: https://github.com/csudhlib/primo-explore-google-analytics
*/
angular.module('googleAnalytics', []);
angular.module('googleAnalytics').run(function ($rootScope, $interval, analyticsOptions) {
  if (analyticsOptions.hasOwnProperty("enabled") && analyticsOptions.enabled) {
    if (analyticsOptions.hasOwnProperty("siteId") && analyticsOptions.siteId != '') {
      if (typeof ga === 'undefined') {
        (function (i, s, o, g, r, a, m) {
          i['GoogleAnalyticsObject'] = r;i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
          }, i[r].l = 1 * new Date();a = s.createElement(o), m = s.getElementsByTagName(o)[0];a.async = 1;a.src = g;m.parentNode.insertBefore(a, m);
        })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

        ga('create', analyticsOptions.siteId, { 'alwaysSendReferrer': true });
        ga('set', 'anonymizeIp', true);
      }
    }
    $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
      if (analyticsOptions.hasOwnProperty("defaultTitle")) {
        var documentTitle = analyticsOptions.defaultTitle;
        var interval = $interval(function () {
          if (document.title !== '') documentTitle = document.title;
          if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1) if (angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).length === 0) return;else documentTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).text();

          if (typeof ga !== 'undefined') {
            if (fromState != toState) ga('set', 'referrer', fromState);
            ga('set', 'location', toState);
            ga('set', 'title', documentTitle);
            ga('send', 'pageview');
          }
          $interval.cancel(interval);
        }, 0);
      }
    });
  }
});
angular.module('googleAnalytics').value('analyticsOptions', {
  enabled: true,
  siteId: 'UA-114106978-1',
  defaultTitle: 'Chico OneSearch'
});
})();