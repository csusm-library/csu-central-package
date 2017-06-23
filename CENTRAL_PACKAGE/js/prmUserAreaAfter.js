/**
 * Show My Account and Sign In without extra click
 */

app.component('prmUserAreaAfter', {
    bindings: { parentCtrl: '<' },
    controller: function($compile, $scope, $templateCache, $element) {
        $templateCache.put('components/search/topbar/userArea/user-area.html', `
          <div layout='row' layout-align="center center">
            <prm-library-card-menu></prm-library-card-menu>
            <prm-authentication layout="flex" [is-logged-in]="$ctrl.userName().length > 0"></prm-authentication>
          </div>`);
        $compile($element.parent())($scope);
    }
});
