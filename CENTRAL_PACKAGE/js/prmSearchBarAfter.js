/**
 * CSU OneSearch logo
 */

app.controller('prmSearchBarAfterController', ['$location', '$window', function($location, $window) {
    /**
     * Navigates to the home page with a reload.
     * @return {boolean} Booelan value indicating if the navigation was successful.
     */
    this.navigateToHomePage = function() {
        var params = $location.search();
        var vid = params.vid;
        var lang = params.lang || "en_US";
        var split = $location.absUrl().split('/primo-explore/');

        if (split.length === 1) {
            console.log(split[0] + ' : Could not detect the view name!');
            return false;
        }

        var baseUrl = split[0];
        $window.location.href = baseUrl + '/primo-explore/search?vid=' + vid + '&lang=' + lang;
        return true;
    };

    /**
     * OneSearch logo
     * @return {string} URI to the one-search logo file in the current view
     */
    this.getOneSearchLogo = function() {
        var params = $location.search();
        var vid = params.vid;
        var campus = {};
        campus['01CALS_UBA'] = 'bakersfield';
        campus['01CALS_UCI'] = 'channel';
        campus['01CALS_CHI'] = 'chico';
        campus['01CALS_UDH'] = 'dominguez';
        campus['01CALS_UHL'] = 'eastbay';
        campus['01CALS_UFR'] = 'fresno';
        campus['01CALS_FUL'] = 'fullerton';
        campus['01CALS_HUL'] = 'humboldt';
        campus['01CALS_ULB'] = 'longbeach';
        campus['01CALS_ULA'] = 'losangeles';
        campus['01CALS_MAL'] = 'maritime';
        campus['01CALS_UMB'] = 'monterey';
        campus['01CALS_MLM'] = 'mlml';
        campus['01CALS_UNO'] = 'northridge';
        campus['01CALS_PUP'] = 'pomona';
        campus['01CALS_USL'] = 'sacramento';
        campus['01CALS_USB'] = 'sanbernardino';
        campus['01CALS_SDL'] = 'sandiego';
        campus['01CALS_SFR'] = 'sanfrancisco';
        campus['01CALS_SJO'] = 'sanjose';
        campus['01CALS_PSU'] = 'slo';
        campus['01CALS_USM'] = 'sanmarcos';
        campus['01CALS_SOL'] = 'sonoma';
        campus['01CALS_UST'] = 'stanislaus';

        return 'custom/CENTRAL_PACKAGE/img/one-search/' + campus[vid] + '.png';
    };

    console.log(this.getOneSearchLogo());
}]);

 app.component('prmSearchBarAfter', {
     bindings: { parentCtrl: '<' },
     controller: 'prmSearchBarAfterController',
     templateUrl: 'custom/CENTRAL_PACKAGE/html/prmSearchBarAfter.html'
 });
