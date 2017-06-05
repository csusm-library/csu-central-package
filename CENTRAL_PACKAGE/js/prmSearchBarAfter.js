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

        return 'custom/' + vid + '/img/one-search.png';
    };

    console.log(this.getOneSearchLogo());
}]);

 app.component('prmSearchBarAfter', {
     bindings: { parentCtrl: '<' },
     controller: 'prmSearchBarAfterController',
     templateUrl: 'custom/CENTRAL_PACKAGE/html/prmSearchBarAfter.html'
 });
