(function() {
  "use strict";
  'use strict';


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

//component to activate search when search scope 
app.component('prmTabsAndScopesSelectorAfter',{
      bindings: {parentCtrl: '<'},
       
      controller: function($scope){
                 setTimeout(function(){
                     function activateSearch(){
               setTimeout(function(){
                 document.getElementsByClassName("zero-margin button-confirm md-button md-primoExplore-theme")[0].click()
                 }, 500)
             }
                                 
                  var searchScopes = document.querySelectorAll('[id^="select_option_"]')
            for (var i in searchScopes){
                searchScopes[i].onclick = function(){
                                activateSearch();
        };
                       }
                              }, 500)
                             
                        }
                             
     });


  //update template to include new URL for institution
  app.component('prmLogoAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.csusb.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

})();
