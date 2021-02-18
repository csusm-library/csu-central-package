/**
 * Collapse institution list in full record
 */

app.controller('institutionToggleController', ['$scope', function($scope) {
    /**
     * On page load, hide libraries
     */
    this.$onInit = function() {
        $scope.showLibs = false;
        $scope.button = angular.element(document.querySelector('prm-alma-more-inst-after'));
        $scope.tabs = angular.element(document.querySelector('prm-alma-more-inst md-tabs'));
        $scope.tabs.addClass('hide');
        $scope.button.after($scope.tabs);
    };

    /**
     * Show or hide library based on previous state
     */
    $scope.toggleLibs = function() {
        $scope.showLibs = !$scope.showLibs;
        if ($scope.tabs.hasClass('hide')) $scope.tabs.removeClass('hide');
        else $scope.tabs.addClass('hide');
    };

}]);

app.component('prmAlmaMoreInstAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'institutionToggleController',
    templateUrl: 'custom/01CALS_NETWORK-CENTRAL_PACKAGE/html/prmAlmaMoreInstAfter.html'
});
