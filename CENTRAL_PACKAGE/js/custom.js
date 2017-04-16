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
	})

})();
