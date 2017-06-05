/**
 * Resolve duplicate source codes
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
    templateUrl: 'custom/CENTRAL_PACKAGE/html/prmServiceDetailsAfter.html'
});
