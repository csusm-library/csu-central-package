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
    templateUrl: 'custom/01CALS_NETWORK-CENTRAL_PACKAGE/html/prmServiceDetailsAfter.html'
});
