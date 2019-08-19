(function() {
  "use strict";
  'use strict';

  var app = angular.module('viewCustom', ['reportProblem','sendSms','angularLoad']);

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
  //add optional Central Package Report a Problem feature, see https://calstate.atlassian.net/wiki/spaces/ULMSD/pages/593199108/Central+Package+optional+features for details
  var premailTimestamp = Date();
  app.constant('reportProblem', {
  enabled: true,
  to: 'LIB-ULMS-Admins@csulb.edu',
  messageText: 'See something that doesn\'t look right?',  // text that appears before the link
  buttonText: 'Report a Problem', // the portion of the text that is the link
  subject: 'OneSearch Problem Report '+premailTimestamp, // email subject line
  });

  //add optional Central Package SMS feature, see https://calstate.atlassian.net/wiki/spaces/ULMSD/pages/593199108/Central+Package+optional+features for details
  app.constant('smsOptions', {
  enabled: true
  });

  //add custom no search results found message - there is also a CSS component to this that hides the original No Results card
  app.controller('prmNoSearchResultAfterController', ['$location', '$element', function($location, $element) {
    this.pcAvailability = ($location.search().pcAvailability === "true" || $location.search().pcAvailability === true) ? true : false;
    this.term = this.parentCtrl.term;
    this.changePcAvailability = function () {
      $location.search("pcAvailability", (this.pcAvailability ? true : false));
    };
  }]);

  app.component('prmNoSearchResultAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmNoSearchResultAfterController',
    templateUrl: 'custom/01CALS_ULB/html/prmNoSearchResultAfter.html'
  });

  //add libchat box
  var cW=document.createElement('script');
  cW.type='application/javascript';
  cW.id='localScript';
  cW.src='//v2.libanswers.com/load_chat.php?hash=f4fa8caa5d8610a0e598d45daf20f93f';
  document.body.appendChild(cW);
  var d=document.createElement('div');
  d.id='libchat_f4fa8caa5d8610a0e598d45daf20f93f';
  d.style.position='fixed';
  d.style.bottom='0%';
  d.style.right='15%';
  d.style.zIndex='12';
  d.style.backgroundColor='#000000';
  d.style.borderStyle='solid';
  d.style.borderWidth='3px';
  d.style.borderColor='#000000';
  d.style.borderRadius='4px 4px 0px 0px';
  document.body.appendChild(d);
  //end libchat

 /** Altmetrics **/
app.controller('FullViewAfterController', ['angularLoad', '$http', '$scope', '$element', '$timeout', '$window', function (angularLoad, $http, $scope, $element, $timeout, $window) {
    var vm = this;
    this.$http = $http;
    this.$element = $element;
    this.$scope = $scope;
    this.$window = $window;

    vm.$onInit = function () //wait for all the bindings to be initialised
    {

        vm.parentElement = this.$element.parent()[0]; //the prm-full-view container

        try {
            vm.doi = vm.parentCtrl.item.pnx.addata.doi[0] || '';
        } catch (e) {
            return;
        }

        if (vm.doi) {
            //If we've got a doi to work with check whether altmetrics has data for it.
            //If so, make our div visible and create a new Altmetrics service
            $timeout(function () {
            $http.get('https://api.altmetric.com/v1/doi/' + vm.doi).then(function () {
                try {
                    //Get the altmetrics widget
                    angularLoad.loadScript('https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js?' + Date.now()).then(function () {});
                    //Create our new Primo service
                    var altmetricsSection = {
                        scrollId: "altmetrics",
                        serviceName: "altmetrics",
                        title: "brief.results.tabs.Altmetrics"
                    };
                    vm.parentCtrl.services.splice(vm.parentCtrl.services.length, 0, altmetricsSection);
                } catch (e) {
                    console.log(e);
                }
            }).catch(function (e) {
                return;
            });
            }, 3000);
        }

        //move the altmetrics widget into the new Altmetrics service section
        var unbindWatcher = this.$scope.$watch(function () {
            return vm.parentElement.querySelector('h4[translate="brief.results.tabs.Altmetrics"]');
        }, function (newVal, oldVal) {
            if (newVal) {
                //Get the section body associated with the value we're watching
                let altContainer = newVal.parentElement.parentElement.parentElement.parentElement.children[1];
                let almt1 = vm.parentElement.children[1].children[0];
                if (altContainer && altContainer.appendChild && altm1) {
                    altContainer.appendChild(altm1);
                }
                unbindWatcher();
            }
        });
    }; // end of $onInit

    //You'd also need to look at removing the various css/js scripts loaded by this.
    //refer to: https://github.com/Det-Kongelige-Bibliotek/primo-explore-rex
      vm.$onDestroy = function ()
  {
        if (this.$window._altmetric) {
            delete this.$window._altmetric;
        }
        if (this.$window._altmetric_embed_init) {
            delete this.$window._altmetric_embed_init;
        }
        if (this.$window.AltmetricTemplates) {
            delete this.$window.AltmetricTemplates;
        }
  }; // end of $onDestroy

}]);

  app.component('prmFullViewAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'FullViewAfterController',
    template: '<div id="altm1" ng-if="$ctrl.doi" class="altmetric-embed" data-hide-no-mentions="true"  data-link-target="new" data-badge-type="medium-donut" data-badge-details="right" data-doi="{{$ctrl.doi}}"></div>'
  }); // end of app.compotent
/** Altmetrics **/

})();
