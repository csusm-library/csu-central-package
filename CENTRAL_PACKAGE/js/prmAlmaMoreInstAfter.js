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
    bindings: { parentCtrl: '<' },
    controller: 'institutionToggleController',
    templateUrl: 'custom/CENTRAL_PACKAGE/html/prmAlmaMoreInstAfter.html'
});
