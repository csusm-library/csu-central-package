/**
 * Show logged in user's name under Sign Out
 */

app.component('prmAuthenticationAfter', {
    bindings: { parentCtrl: '<' },
    controller: function controller($compile, $scope, $templateCache, $element) {
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
