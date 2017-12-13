/**
 * Show logged in user's name under Sign Out
 */

app.component('prmAuthenticationAfter', {
    bindings: { parentCtrl: '<' },
    controller: function controller($compile, $scope, $templateCache, $element) {
      var vm = this;
      var loginServ = vm.parentCtrl.loginService;
      vm.$onInit = function () {
        loginServ.normalizeTargetUrl = function () {
          // Certain characters don't go through all Identity Providers.
          var sanitize = function(input) {
            if (input && typeof(input) == "string") {
              return input
                .replace(/</g, '%3C')
                .replace(/>/g, '%3E')
                .replace(/{/g, '%7B')
                .replace(/}/g, '%7D')
                .replace(/"/g, '%22');
            } else {
              return input;
            }
          };
          var URL = decodeURIComponent(this.$location.absUrl());
          var fields = URL.split('?', 2);
          var returnURL = fields[0];
          if (fields.length > 1) {
            returnURL = returnURL + '?';
            // Note this.$state.params applies to the base page.
            // this._toParams covers the case of a dialog/layer on top of the page.
            angular.forEach(this._toParams, function (value, key) {
              if (value) {
                returnURL = returnURL + encodeURIComponent(sanitize(key)) + '=' +
                encodeURIComponent(sanitize(value)) + '&';
              }
            }, this);
          }
          return returnURL;
        }
      };
			$templateCache.put('components/search/topbar/userArea/authentication.html', `
		  <div class="md-fab-toolbar-wrapper">
		  <md-button ng-if="!$ctrl.isLoggedIn" ng-click="$ctrl.handleLogin();" aria-label="{{\'eshelf.signin.title\' | translate}}" class="button-with-icon zero-margin">
		    <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-in"></prm-icon>
		    <span><span translate="eshelf.signin.title"></span></span></span>
		  </md-button>
		  <md-button ng-if="$ctrl.isLoggedIn" ng-click="$ctrl.handleLogout(authenticationMethod)" aria-label="{{\'eshelf.signout.title.link\' | translate}}" class="button-with-icon zero-margin authentication-multiline">
		    <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-out"></prm-icon>
		    <div class="layout-align-center-start layout-column">
		      <span translate="eshelf.signout.title.link"></span>
		      <span>{{$ctrl.loginService.userSessionManagerService.jwtUtilService.getDecodedToken().userName}}</span>
		    </div>
		  </md-button>`);
        $compile($element.parent())($scope);
    }
});
