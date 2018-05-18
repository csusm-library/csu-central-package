(function(){
"use strict";
'use strict';

/* BEGIN custom.module.js */
function fontawesomeDirective() {
  var injectScript = function injectScript(element) {
    var scriptTag = angular.element(document.createElement('script'));
    scriptTag.attr('charset', 'utf-8');
    scriptTag.attr('src', 'https://use.fontawesome.com/754931a632.js');
    element.append(scriptTag);
  };

  return {
    link: function link(scope, element) {
      injectScript(element);
    }
  };
}
var app = angular.module('viewCustom', ['angularLoad']).directive('fontawesome', fontawesomeDirective);
/* END custom.module.js */

/* BEGIN primo-explore-calpoly-font-awesome.js */
// Add Clickable Logo
app.controller('prmTopBarBeforeController', [function () {
  var vm = this;
}]);

app.component('prmTopBarBefore', {
  bindings: { parentCtrl: '<' },
  controller: 'prmTopBarBeforeController',
  template: '' + '<script src="https://use.fontawesome.com/754931a632.js"></script>'
});
/* END primo-explore-calpoly-font-awesome.js */

/* BEGIN primo-explore-calpoly-run.js */
app.run(['$location', '$window', function ($location, $window) {
  if ($location.search().go === 'account') {
    var url = 'https://cpslo-primo.hosted.exlibrisgroup.com/primo_library/libweb/primoExploreLogin?institution=01CALS_PSU&target-url=https://cpslo-primo.hosted.exlibrisgroup.com/primo-explore/account?vid=01CALS_PSU%26lang%3Den_US%26section%3Doverview&authenticationProfile=01CALS_PSU%20SAML';
    $window.location.href = url;
  }
}]);
/* END primo-explore-calpoly-run.js */
})();