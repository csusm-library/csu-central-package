 (function() {
	"use strict";
	'use strict';

	var app = angular.module('viewCustom', ['angularLoad']);

	/**
	 * resolve duplicate source codes
	 * takes first source code instance and removes additional characters
	 */
	app.controller('prmServiceDetailsAfterController', [function() {

		this.getKillCodeLink = function() {

			// primo central record

			if (this.parentCtrl.item.context == "PC") {
				return this.parentCtrl.item.pnx.display.source[0];
			}

			// alma records; show only first, sans identifier code

			return this.parentCtrl.item.pnx.display.source[0].replace(/\$\$V/g, "").replace(/\$\$O01CALS_ALMA/g, '').replace(/[0-9]/g, '');
		}

	}]);

	app.component('prmServiceDetailsAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmServiceDetailsAfterController',
		template: '<div layout="row" layout-xs="column" class="layout-block-xs layout-xs-column layout-row"><div flex-gt-sm="20" flex-gt-xs="25" class="flex-gt-xs-25 flex-gt-sm-20 flex"><span class="bold-text" title="Source">Source</span></div><div flex="" class="flex"><div><div layout="column" class="spaced-rows word-break layout-column">{{$ctrl.getKillCodeLink()}}</div></div></div></div>'
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


})();
