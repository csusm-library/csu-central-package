(function() {
"use strict";

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


//update template to include new URL for institution
app.component('prmLogoAfter', {
bindings: {
	parentCtrl: '<'
    },
controller: 'prmLogoAfterController',
template: '<div class="logo-container" layout="row" layout-fill><div class="flex-item"><a class="image-link" href="http://www.csun.edu"><img alt="CSUN" src="custom/01CALS_UNO/img/CSUN-Wordmark.png"/></a></div><div class="flex-item"><a class="image-link" href="https://csun-primo.hosted.exlibrisgroup.com/primo-explore/search?vid=01CALS_UNO"><img alt="Onesearch" src="custom/01CALS_UNO/img/CSUN-Onesearch.png"/></a></div></div>'
  });
  


/**
* Collapse institution list in full record
*/

app.controller('institutionToggleController', ['$scope', function($scope) {
        this.$onInit = function() {
            $scope.showLibs = false;
        	$scope.button = angular.element(document.querySelector('prm-alma-more-inst-after'));
            $scope.tabs = angular.element(document.querySelector('prm-alma-more-inst md-tabs'));
            $scope.tabs.addClass('hide');
        	$scope.button.after($scope.tabs);
        	$scope.toggleLibs = function() {
        		$scope.showLibs = !$scope.showLibs;
        		if ($scope.tabs.hasClass('hide')) $scope.tabs.removeClass('hide');
        		else $scope.tabs.addClass('hide');
        	};
        };
    }]);

app.component('prmAlmaMoreInstAfter', {
	controller: 'institutionToggleController',
    template: `<md-button class="md-raised" ng-click="toggleLibs()">
    	{{ showLibs ? 'Hide Libraries &laquo;' : 'Show Libraries &raquo;' }}
    			</md-button>`
    });
	
/* Overwrite user area */
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

app.controller('prmUserAreaAfterController', function($compile, $scope, $templateCache, $element) {
  $templateCache.put('components/search/topbar/userArea/user-area.html', `
    <md-button class="mobile-menu-button zero-margin" aria-label="{{'nui.aria.userarea.open' | translate}}" (click)="$ctrl.enableMobileMenu()" hide-gt-xs style="min-width: 60px">
      <prm-icon [icon-type]="::$ctrl.topBarIcons.more.type" [svg-icon-set]="::$ctrl.topBarIcons.more.iconSet" [icon-definition]="::$ctrl.topBarIcons.more.icon">
      </prm-icon>
    </md-button>
    <md-toolbar hide-xs>
      <md-fab-actions class="md-toolbar-tools zero-padding buttons-group">
        <prm-authentication layout="flex" [is-logged-in]="$ctrl.userName().length > 0"></prm-authentication>
        <prm-library-card-menu hide-sm></prm-library-card-menu>
      </md-fab-actions>
    </md-toolbar>`);
 
    $compile($element.parent())($scope);
});
	
/**
 * Resolve duplicate source codes
 */

app.controller('prmServiceDetailsAfterController', ['$location', function($location) {
    /**
     * Resolve duplicate source codes
     * takes first source code instance and removes additional characters
     * @return {string} source code name
     */
    this.getSourceName = function() {

        // primo central record
        if (this.parentCtrl.item.context == "PC") {
            return this.parentCtrl.item.pnx.display.source[0];
        }

        // alma records; show only first, sans identifier code
        return this.parentCtrl.item.pnx.display.source[0].replace(/\$\$V/g, "").replace(/\$\$O01CALS_ALMA/g, '').replace(/[0-9]/g, '');
    }

    /**
     * Earlier title link
     * @return {string}
     */
    this.getLateralTitleLink = function(title) {

        var params = $location.search();
        var vid = params.vid;
        var query = encodeURI('title,exact,' + title + ',AND');
        var url = '/primo-explore/search?query=' + query + '&vid=' + vid + '&mode=advanced';
        return url;
    }

}]);


app.component('prmServiceDetailsAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'prmServiceDetailsAfterController',
    templateUrl: 'custom/01CALS_UNO/html/prmServiceDetailsAfter.html'
});

})();

 
