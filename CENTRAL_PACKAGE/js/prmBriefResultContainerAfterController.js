/**
 * Remove course reserves icon
 */
 
app.controller('prmBriefResultContainerAfterController', [function () {
    var vm = this.parentCtrl

    Object.defineProperty(vm, "isCourseDocument", {
        get: function () { return vm.item.pnx.display.crsinfo[0].includes(vm.institutionCode); }
    });
}]);
