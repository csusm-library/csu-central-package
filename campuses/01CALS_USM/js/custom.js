(function(){
"use strict";
'use strict';

var app = angular.module('viewCustom', ['angularLoad'], function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|data):/);
});

function addProxy() {
    // This function does not handle the on-campus/off-campus check box in the Institution wizard (i.e. it adds the proxy even if the user is on-campus)
    app.controller('prmServiceLinksAfterController', [function () {
        var vm = this;
        var parentCtrl = vm.parentCtrl;
        var baseURLsTable = window.appConfig['mapping-tables']['Institution Base URLs'];
        var instCode = window.appConfig['primo-view'].institution['institution-code'];
        var baseURL = 'proxy_prefix';

        vm.$onInit = function () {
            var pnxRecord = vm.parentCtrl.item.pnx;
            var proxyAll = 'N';
            var proxy = '';

            // find the proxy URL
            angular.forEach(baseURLsTable, function (value, key) {
                if (value.source1 == instCode && value.source2 == baseURL) {
                    proxy = value.target;
                    if (typeof value.source4 == 'undefined' && value.source4 == 'Y') {
                        proxyAll = 'Y';
                    }
                }
            });

            if (parentCtrl.item.context == "PC") {
                //Primo Central record; proxy candidate
                if (proxyAll == 'Y' || typeof pnxRecord.addata.oa == 'undefined' || pnxRecord.addata.oa[0] != 'free_for_read') {
                    // No addata/oa or addata/oa does not contain "free_for_read"; proxy
                    angular.forEach(parentCtrl.recordLinks, function (value, key) {
                        value.linkURL = proxy + value.linkURL;
                    });
                }
            }
        };
    }]);

    app.component('prmServiceLinksAfter', {
        bindings: {
            parentCtrl: '<'
        },
        controller: 'prmServiceLinksAfterController'
    });
}
addProxy();

app.component('prmExploreMainAfter', {
    bindings: {
        parentCtrl: '<'
    },

    controller: function controller($scope) {
        var vm = this;
        vm.parentCtrl.searchService.cheetah.PAGE_SIZE = 20;
        vm.parentCtrl.itemsPerPage = 20;
        vm.parentCtrl.PAGE_SIZE = 20;
        vm.parentCtrl.searchService.cheetah.configurationUtil.searchStateService.resultsBulkSize = 20;
        vm.parentCtrl.configurationUtil.systemConfiguration["FE UI – Scrolling Threshold"] = 20;

        window.setInterval(function () {
            setTimeout(function () {
                var checkFirstPage = document.body.innerHTML.toString().search('md-subheader _md md-primoExplore-theme');
                setTimeout(function () {
                    var checkFirstPage = document.body.innerHTML.toString().search('list-item-wrapper first-in-page');
                    if (checkFirstPage > -1) {
                        var firstDiv = document.getElementsByClassName("list-item-wrapper first-in-page");
                        var arrayLength = firstDiv.length;
                        for (var i = 0; i < arrayLength; i++) {
                            document.getElementsByClassName('list-item-wrapper first-in-page')[0].classList.remove('first-in-page');
                        }
                    }
                }, 500);

                if (checkFirstPage > -1) {
                    var firstDiv = document.getElementsByClassName("md-subheader _md md-primoExplore-theme");
                    var arrayLength = firstDiv.length;
                    for (var i = 0; i < arrayLength; i++) {
                        angular.element(firstDiv).remove();
                    }
                }
            }, 500);
        }, 500);
    }
});

//Add Text Record Link and RIS Export

app.component('prmActionListAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmActionListAfterController',
    template: '<div class="action-list-addon">\n        <a ng-href="data:text/plain;charset=utf-8,{{$ctrl.getRIS()}}" download="catalyst.ris">\n        <div layout="column" layout-align="center center" class="layout-align-center-center layout-column">\n        <prm-icon style="z-index:1; color: rgba(0, 0, 0, 0.57);" icon-type="svg" svg-icon-set="primo-actions" icon-definition="refworks"></prm-icon>\n        <span class="action-list-addon-text">Export RIS<br><div style="line-height:0px;">(Zotero)</div></span>\n        </div>\n        </a>\n        </div>\n        \n        <div style="clear:both;"></div>'
});

app.controller('prmActionListAfterController', [function () {
    var vm = this;
    var items = vm.parentCtrl.item.length;
    vm.getRIS = getRIS;

    function getRIS() {
        var RIS = "";

        if (typeof items !== 'undefined') {

            for (var c = 0; c < items; c++) {
                if (typeof vm.parentCtrl.item[c].pnx.addata.au !== 'undefined') {
                    var totalau = vm.parentCtrl.item[c].pnx.addata.au.length;
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.addau !== 'undefined') {
                    var totaladdau = vm.parentCtrl.item[c].pnx.addata.addau.length;
                }
                RIS += "TY  - " + vm.parentCtrl.item[c].pnx.addata.ristype[0] + "\r\n";
                if (typeof vm.parentCtrl.item[c].pnx.addata.addau !== 'undefined' && typeof totaladdau !== 'undefined') {
                    for (var y = 0; y < totaladdau; y++) {
                        RIS += "A2  - " + vm.parentCtrl.item[c].pnx.addata.addau[y] + "\r\n";
                    }
                }

                if (typeof vm.parentCtrl.item[c].pnx.addata.au !== 'undefined' && typeof totalau !== 'undefined') {
                    for (var z = 0; z < totalau; z++) {
                        RIS += "AU  - " + vm.parentCtrl.item[c].pnx.addata.au[z] + "\r\n";
                    }
                }

                if (typeof vm.parentCtrl.item[c].pnx.search.subject != "undefined") {
                    var totalsubject = vm.parentCtrl.item[c].pnx.search.subject.length;
                }
                if (typeof vm.parentCtrl.item[c].pnx.search.subject !== 'undefined' && typeof totalsubject !== 'undefined') {
                    for (var w = 0; w < totalsubject; w++) {
                        RIS += "KW  - " + vm.parentCtrl.item[c].pnx.search.subject[w] + "\r\n";
                    }
                }
                if (typeof vm.parentCtrl.item[c].pnx.control.recordid !== 'undefined') {
                    RIS += "ID  - " + vm.parentCtrl.item[c].pnx.control.recordid[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.btitle !== 'undefined') {
                    RIS += "T1  - " + vm.parentCtrl.item[c].pnx.addata.btitle[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.notes !== 'undefined') {
                    RIS += "N1  - " + vm.parentCtrl.item[c].pnx.addata.notes[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.addtitle !== 'undefined') {
                    RIS += "T2  - " + vm.parentCtrl.item[c].pnx.addata.addtitle[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.jtitle !== 'undefined') {
                    RIS += "T2  - " + vm.parentCtrl.item[c].pnx.addata.jtitle[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.stitle !== 'undefined') {
                    RIS += "JA  - " + vm.parentCtrl.item[c].pnx.addata.stitle[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.date !== 'undefined') {
                    RIS += "Y1  - " + vm.parentCtrl.item[c].pnx.addata.date[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.cop !== 'undefined') {
                    RIS += "CY  - " + vm.parentCtrl.item[c].pnx.addata.cop[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.pub !== 'undefined') {
                    RIS += "PB  - " + vm.parentCtrl.item[c].pnx.addata.pub[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.doi !== 'undefined') {
                    RIS += "DO  - " + vm.parentCtrl.item[c].pnx.addata.doi[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.display.edition !== 'undefined') {
                    RIS += "ET  - " + vm.parentCtrl.item[c].pnx.display.edition[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.issue !== 'undefined') {
                    RIS += "IS  - " + vm.parentCtrl.item[c].pnx.addata.issue[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.abstract !== 'undefined') {
                    RIS += "AB  - " + vm.parentCtrl.item[c].pnx.addata.abstract[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.atitle !== 'undefined') {
                    RIS += "TI  - " + vm.parentCtrl.item[c].pnx.addata.atitle[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.eissn !== 'undefined') {
                    RIS += "SN  - " + vm.parentCtrl.item[c].pnx.addata.eissn[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.spage !== 'undefined') {
                    RIS += "SP  - " + vm.parentCtrl.item[c].pnx.addata.spage[0] + "\r\n";
                }
                if (typeof vm.parentCtrl.item[c].pnx.addata.volume !== 'undefined') {
                    RIS += "VL  - " + vm.parentCtrl.item[c].pnx.addata.volume[0] + "\r\n";
                }
                RIS += "ER  -\r\n";
            }
        } else {
            if (typeof vm.parentCtrl.item.pnx.addata.au !== 'undefined') {
                var totalau = vm.parentCtrl.item.pnx.addata.au.length;
            }
            if (typeof vm.parentCtrl.item.pnx.addata.addau !== 'undefined') {
                var totaladdau = vm.parentCtrl.item.pnx.addata.addau.length;
            }
            RIS += "TY  - " + vm.parentCtrl.item.pnx.addata.ristype[0] + "\r\n";
            if (typeof vm.parentCtrl.item.pnx.addata.addau !== 'undefined' && typeof totaladdau !== 'undefined') {
                for (var y = 0; y < totaladdau; y++) {
                    RIS += "A2  - " + vm.parentCtrl.item.pnx.addata.addau[y] + "\r\n";
                }
            }

            if (typeof vm.parentCtrl.item.pnx.addata.au !== 'undefined' && typeof totalau !== 'undefined') {
                for (var z = 0; z < totalau; z++) {
                    RIS += "AU  - " + vm.parentCtrl.item.pnx.addata.au[z] + "\r\n";
                }
            }

            if (typeof vm.parentCtrl.item.pnx.search.subject != "undefined") {
                var totalsubject = vm.parentCtrl.item.pnx.search.subject.length;
            }
            if (typeof vm.parentCtrl.item.pnx.search.subject !== 'undefined' && typeof totalsubject !== 'undefined') {
                for (var w = 0; w < totalsubject; w++) {
                    RIS += "KW  - " + vm.parentCtrl.item.pnx.search.subject[w] + "\r\n";
                }
            }

            if (typeof vm.parentCtrl.item.pnx.control.recordid !== 'undefined') {
                RIS += "ID  - " + vm.parentCtrl.item.pnx.control.recordid[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.btitle !== 'undefined') {
                RIS += "T1  - " + vm.parentCtrl.item.pnx.addata.btitle[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.notes !== 'undefined') {
                RIS += "N1  - " + vm.parentCtrl.item.pnx.addata.notes[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.addtitle !== 'undefined') {
                RIS += "T2  - " + vm.parentCtrl.item.pnx.addata.addtitle[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.jtitle !== 'undefined') {
                RIS += "T2  - " + vm.parentCtrl.item.pnx.addata.jtitle[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.stitle !== 'undefined') {
                RIS += "JA  - " + vm.parentCtrl.item.pnx.addata.stitle[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.date !== 'undefined') {
                RIS += "Y1  - " + vm.parentCtrl.item.pnx.addata.date[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.cop !== 'undefined') {
                RIS += "CY  - " + vm.parentCtrl.item.pnx.addata.cop[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.pub !== 'undefined') {
                RIS += "PB  - " + vm.parentCtrl.item.pnx.addata.pub[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.doi !== 'undefined') {
                RIS += "DO  - " + vm.parentCtrl.item.pnx.addata.doi[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.display.edition !== 'undefined') {
                RIS += "ET  - " + vm.parentCtrl.item.pnx.display.edition[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.issue !== 'undefined') {
                RIS += "IS  - " + vm.parentCtrl.item.pnx.addata.issue[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.abstract !== 'undefined') {
                RIS += "AB  - " + vm.parentCtrl.item.pnx.addata.abstract[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.atitle !== 'undefined') {
                RIS += "TI  - " + vm.parentCtrl.item.pnx.addata.atitle[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.eissn !== 'undefined') {
                RIS += "SN  - " + vm.parentCtrl.item.pnx.addata.eissn[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.spage !== 'undefined') {
                RIS += "SP  - " + vm.parentCtrl.item.pnx.addata.spage[0] + "\r\n";
            }
            if (typeof vm.parentCtrl.item.pnx.addata.volume !== 'undefined') {
                RIS += "VL  - " + vm.parentCtrl.item.pnx.addata.volume[0] + "\r\n";
            }
            RIS += "ER  -";
        }
        return encodeURIComponent(RIS);
    }
}]);

/**
 * Collapse institution list in full record
 */

app.controller('institutionToggleController', ['$scope', function ($scope) {
    /**
     * On page load, hide libraries
     */
    this.$onInit = function () {
        $scope.showLibs = false;
        $scope.button = angular.element(document.querySelector('prm-alma-more-inst-after'));
        $scope.tabs = angular.element(document.querySelector('prm-alma-more-inst md-tabs'));
        $scope.tabs.addClass('hide');
        $scope.button.after($scope.tabs);
    };

    /**
     * Show or hide library based on previous state
     */
    $scope.toggleLibs = function () {
        $scope.showLibs = !$scope.showLibs;
        if ($scope.tabs.hasClass('hide')) $scope.tabs.removeClass('hide');else $scope.tabs.addClass('hide');
    };
}]);

app.component('prmAlmaMoreInstAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'institutionToggleController',
    templateUrl: 'custom/01CALS_USM/html/prmAlmaMoreInstAfter.html'
});

/**
 * Add Clickable Logo
 */

app.controller('prmLogoAfterController', [function () {
    var vm = this;
    vm.getIconLink = getIconLink;
    function getIconLink() {
        return vm.parentCtrl.iconLink;
    }
}]);

app.component('prmLogoAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner" tabindex="0" role="banner">\n  <a href="https://biblio.csusm.edu/">\n  <img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
});

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
}

/**
 * Display facet to search Primo Central results if no results were found
 */

app.controller('prmNoSearchResultAfterController', ['$location', '$element', function ($location, $element) {
    /**
     * Determine if the pcAvailability parameter is already set
     */
    this.pcAvailability = $location.search().pcAvailability === "true" || $location.search().pcAvailability === true ? true : false;

    /**
     * The value that was searched
     */
    this.term = this.parentCtrl.term;

    /**
     * Change pcAvailability parameter
     */
    this.changePcAvailability = function () {
        $location.search("pcAvailability", this.pcAvailability ? true : false);
    };
}]);

app.component('prmNoSearchResultAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmNoSearchResultAfterController',
    templateUrl: 'custom/01CALS_USM/html/prmNoSearchResultAfter.html'
});

app.controller('prmSearchResultListAfterController', ['$location', '$scope', function ($location, $scope) {
    this.visible = function () {
        if ($location.path() === "/search" || $location.path() === "/jsearch") return true;
    };
}]);

app.component('prmSearchResultListAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmSearchResultListAfterController',
    templateUrl: 'custom/01CALS_USM/html/prmSearchResultListAfter.html'
});

/**
 * Resolve duplicate source codes
 */

app.controller('prmServiceDetailsAfterController', ['$location', function ($location) {
    /**
     * Resolve duplicate source codes
     * takes first source code instance and removes additional characters
     * @return {string} source code name
     */
    this.getSourceName = function () {

        // primo central record
        if (this.parentCtrl.item.context == "PC") {
            return this.parentCtrl.item.pnx.display.source[0];
        }

        // alma records; show only first, sans identifier code
        return this.parentCtrl.item.pnx.display.source[0].replace(/\$\$V/g, "").replace(/\$\$O01CALS_ALMA/g, '').replace(/[0-9]/g, '');
    };

    /**
     * Earlier title link
     * @return {string}
     */
    this.getLateralTitleLink = function (title) {

        var params = $location.search();
        var vid = params.vid;
        var query = encodeURI('title,exact,' + title + ',AND');
        var url = '/primo-explore/search?query=' + query + '&vid=' + vid + '&mode=advanced';
        return url;
    };
}]);

app.component('prmServiceDetailsAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmServiceDetailsAfterController',
    templateUrl: 'custom/01CALS_USM/html/prmServiceDetailsAfter.html'
});

app.component('prmTabsAndScopesSelectorAfter', {
    bindings: {
        parentCtrl: '<'
    },

    controller: function controller($scope) {
        setTimeout(function () {
            function activateSearch() {
                setTimeout(function () {
                    document.getElementsByClassName("zero-margin button-confirm md-button md-primoExplore-theme")[0].click();
                }, 500);
            }
            var searchScopes = document.querySelectorAll('[id^="select_option_"]');
            for (var i in searchScopes) {
                console.log(searchScopes[i]);
                if (searchScopes[i]) {
                    searchScopes[i].onclick = function () {
                        activateSearch();
                    };
                }
            }
        }, 500);
    }
});

/**
 * Show My Account and Sign In without extra click
 */

app.component('prmUserAreaAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: function controller($compile, $scope, $templateCache, $element) {
        $templateCache.put('components/search/topbar/userArea/user-area.html', '\n        <div class="md-fab-toolbar-wrapper">\n            <md-toolbar hide-xs>\n                <md-fab-actions class="md-toolbar-tools zero-padding buttons-group">\n                    <prm-library-card-menu></prm-library-card-menu>\n                    <prm-authentication layout="flex" [is-logged-in]="$ctrl.userName().length > 0"></prm-authentication>\n                </md-fab-actions>\n            </md-toolbar>\n            <md-button class="mobile-menu-button zero-margin" aria-label="{{\'nui.aria.userarea.open\' | translate}}" (click)="$ctrl.enableMobileMenu()" style="min-width: 60px" hide-gt-xs>\n                <prm-icon [icon-type]="::$ctrl.topBarIcons.more.type" [svg-icon-set]="::$ctrl.topBarIcons.more.iconSet" [icon-definition]="::$ctrl.topBarIcons.more.icon"></prm-icon>\n            </md-button>\n        </div>\n        <md-button style="display: none !important;"></md-button>\n        <md-button style="display: none !important;"></md-button>');
        $compile($element.parent())($scope);
    }
});

/** Bring back the scopes for basic searches **/
app.controller('SearchBarAfterController', ['angularLoad', function (angularLoad) {
    var vm = this;

    vm.parentCtrl.showTabsAndScopes = true;
}]);

app.component('prmSearchBarAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'SearchBarAfterController',
    templateUrl: 'custom/01CALS_USM/html/prmSearchBarAfter.html'
});

/** END Bring back the scopes for basic searches **/

app.controller('FullViewAfterController', ['angularLoad', function (angularLoad) {
    var vm = this;
    vm.doi = vm.parentCtrl.item.pnx.addata.doi[0] || '';

    vm.$onInit = function () {
        angularLoad.loadScript('https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js?' + Date.now()).then(function () {});
    };
}]);

app.component('prmFullViewAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'FullViewAfterController',
    template: '<div class="full-view-section loc-altemtrics" flex-md="70" flex-lg="70" flex-xl="70" flex>\n                <div class="layout-full-width full-view-section-content" ng-if="$ctrl.doi">\n                <div class="section-header" layout="row" layout-align="center center">\n                    <h2 class="section-title md-title light-text">\n                        Social Popularity Statistics (AltMetrics) :\n                    </h2>\n                    <md-divider flex>\n                    </md-divider>\n                    </div>\n                    <div class="full-view-section">\n                       <div class="full-view-section-content">\n                            <div class="section-body" layout="row" layout-align="center center">\n                                <div class="spaced-rows" layout="column">\n                                    <div ng-if="$ctrl.doi" class="altmetric-embed" data-badge-type="medium-donut" data-badge-details="right" data-doi="{{$ctrl.doi}}">\n                                    </div>\n                                </div>\n                            </div>\n                       </div>\n                    </div>\n                </div>\n                </div>'
});

/** Google Analytics **/

app.run(function ($rootScope, $location, $state, $stateParams, $timeout, $interval) {

    var apath = window.location.href;
    var domainDev = "http://localhost:8003/primo-explore";
    var domainProd = "https://csusm-primo.hosted.exlibrisgroup.com/primo-explore";
    var rpath = apath.replace(domainDev, "/dev");
    var rpath = rpath.replace(domainProd, "");
    var fullDisplayPath = "fulldisplay";
    var docTitle = document.title;
    if (document.title.length === 0) {
        var docTitle = "Discovery Search";
    }
    var openURLDisplayPath = "openurl";
    var itemTitleText = "";
    console.log("intial load | doc.title: ", docTitle);
    console.log("intial load | apath: ", apath);

    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o), m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-4199304-12', {
        'alwaysSendReferrer': true
    });
    if (apath.indexOf(openURLDisplayPath) !== -1 || apath.indexOf(fullDisplayPath) !== -1) {
        var interval = $interval(function () {
            if (angular.element(document.querySelector('prm-full-view-service-container')).length === 0) {
                return;
            }
            var itemTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a'));
            var itemTitleText = itemTitle.text();
            console.log("openURL | item title: ", itemTitleText);
            console.log("openURL | doc.title: ", docTitle);
            ga('set', 'page', rpath);
            ga('set', 'title', itemTitleText);
            ga('send', 'pageview');
            $interval.cancel(interval);
        }, 0);
    } else if (docTitle == '') {
        var interval = $interval(function () {
            if (angular.element(document.title == "")) {
                return;
            }
            console.log("intial load 2 | doc.title: ", docTitle);
            console.log("intial load 2 | apath: ", apath);
            ga('set', 'page', rpath);
            ga('set', 'title', document.title);
            ga('send', 'pageview');
            $interval.cancel(interval);
        }, 0);
    } else {
        if (document.title.length === 0) {
            var docTitle = "Discovery Search";
        }

        console.log("intial load 3 | document.title: ", document.title);
        console.log("intial load 3 | doc.title: ", docTitle);
        console.log("intial load 3 | apath: ", apath);
        ga('set', 'page', rpath);
        ga('set', 'title', docTitle);
        ga('send', 'pageview');
    }
    ga('send', 'pageview');

    $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {

        if (fromState != toState) {
            var apath = toState;
            var rpath = apath.replace(domainDev, "/dev");
            var rpath = rpath.replace(domainProd, "");
            var itemTitleText = "";

            if (toState.indexOf(fullDisplayPath) !== -1) {
                var interval = $interval(function () {
                    if (angular.element(document.querySelector('prm-full-view-service-container')).length === 0) {
                        return;
                    }
                    var itemTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a'));
                    var itemTitleText = itemTitle.text();
                    console.log("$locationChangeSuccess | item title: ", itemTitleText);
                    console.log("$locationChangeSuccess | event: ", event);
                    console.log("$locationChangeSuccess | referrerUrl: ", fromState);
                    console.log("$locationChangeSuccess | toState: ", toState);
                    console.log("$locationChangeSuccess | document.title: ", document.title);
                    ga('set', 'referrer', fromState);
                    ga('set', 'page', rpath);
                    ga('set', 'title', itemTitleText);
                    ga('send', 'pageview');
                    $interval.cancel(interval);
                }, 0);
            } else {
                console.log("$locationChangeSuccess | item title: ", itemTitleText);
                console.log("$locationChangeSuccess | event: ", event);
                console.log("$locationChangeSuccess | referrerUrl: ", fromState);
                console.log("$locationChangeSuccess | toState: ", toState);
                console.log("$locationChangeSuccess | document.title: ", document.title);
                ga('set', 'referrer', fromState);
                ga('set', 'page', rpath);
                ga('set', 'title', document.title);
                ga('send', 'pageview');
            }
        }
    });
});

/** Google Analytics **/
})();