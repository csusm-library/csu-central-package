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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
     * full-text indicator link on full record page
     * replace pseudo-link full text with actual link from pnx
     * @author Ron Gilmour <rgilmour@ithaca.edu>

     app.controller('prmSearchResultAvailabilityLineAfterController', [function() {
        
        // what is it?
        
        try {
            this.category = this.parentCtrl.result.delivery.GetIt1[0].category;
        } catch(e) {
            this.category = "";
        }

        // translate category type to display text
        
        if (this.category === "Online Resource") {
            this.quickUrlText = "Online access";
        } else if (this.category === "Remote Search Resource") {
            this.quickUrlText = "Full text available";
        } else { // this default should help me spot any weird cases
            this.quickUrlText = "LINK";
        }

        // the prioritized full-text link
        
        try {
            this.quickUrl = this.parentCtrl.result.delivery.GetIt1[0].links[0].link;
        } catch(e) {
            this.quickUrl = "";
        }

        // is it online?
        
        try {
            this.online = this.parentCtrl.result.delivery.GetIt1[0].links[0].isLinktoOnline;
        } catch(e) {
            this.online = false;
        }
    }]);

    app.component('prmSearchResultAvailabilityLineAfter', {
        bindings: { parentCtrl: '<' },
        controller: 'prmSearchResultAvailabilityLineAfterController',
        template: '<div class="ic-access-link-area" ng-show="$ctrl.online"><prm-icon icon-definition="link" icon-type="svg" svg-icon-set="primo-ui"></prm-icon><a href="{{$ctrl.quickUrl}}" target="_blank">{{$ctrl.quickUrlText}}</a>&nbsp;<prm-icon icon-definition="open-in-new" icon-type="svg" svg-icon-set="primo-ui"></prm-icon><prm-icon icon-definition="chevron-right" icon-type="svg" svg-icon-set="primo-ui"></prm-icon></div>'
    });
    */
    
})();
