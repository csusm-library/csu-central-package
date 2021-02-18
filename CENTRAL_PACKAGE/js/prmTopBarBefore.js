/**
 * Alert bar
 */

app.controller('prmTopBarBeforeController', ['$location', function($location) {

}]);

app.component('prmTopBarBefore', {
    bindings: { parentCtrl: '<' },
    controller: 'prmTopBarBeforeController',
    templateUrl: 'custom/01CALS_NETWORK-CENTRAL_PACKAGE/html/prmTopBarBefore.html'
});
