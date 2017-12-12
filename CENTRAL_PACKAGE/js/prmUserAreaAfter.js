/**
 * Show My Account and Sign In without extra click
 */

app.component('prmUserAreaAfter', {
    bindings: { parentCtrl: '<' },
    controller: function controller($compile, $scope, $templateCache, $element) {
        $templateCache.put('components/search/topbar/userArea/user-area.html', `
		  <div class="md-fab-toolbar-wrapper">
		    <md-toolbar hide-xs>
		      <md-fab-actions class="md-toolbar-tools zero-padding buttons-group">
		        <prm-library-card-menu></prm-library-card-menu>
		        <prm-authentication layout="flex" [is-logged-in]="$ctrl.userName().length > 0"></prm-authentication>
		      </md-fab-actions>
		    </md-toolbar>
		    <md-button class="mobile-menu-button zero-margin" aria-label="{{\'nui.aria.userarea.open\' | translate}}" (click)="$ctrl.enableMobileMenu()" style="min-width: 60px" hide-gt-xs>
		      <prm-icon [icon-type]="::$ctrl.topBarIcons.more.type" [svg-icon-set]="::$ctrl.topBarIcons.more.iconSet" [icon-definition]="::$ctrl.topBarIcons.more.icon"></prm-icon>
		    </md-button>
		  </div>
          <md-button style="display: none !important;"></md-button>
          <md-button style="display: none !important;"></md-button>`);
        $compile($element.parent())($scope);
    }
});
