(function(){
"use strict";
'use strict';

/* Load JQuery */

var js = document.createElement('script');
js.src = "//ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js";
document.head.appendChild(js);

var app = angular.module('viewCustom', ['angularLoad', 'searchBarSubMenu', 'externalSearch', 'reportProblem']);

app.value('searchTargets', [{
    "name": "CSU+",
    "url": "https://csusm-primo.hosted.exlibrisgroup.com/primo-explore/search?institution=01CALS_USM&vid=01CALS_USM&tab=csu&search_scope=01CALS&mode=simple&query=any,contains,",
    "img": "https://biblio.csusm.edu/sites/all/themes/rebel2017/images/onesearch_icon.png",
    mapping: function mapping(queries, filters) {
        try {
            return queries.map(function (part) {
                return part.split(",")[2] || "";
            }).join(' ');
        } catch (e) {
            return '';
        }
    }
}, {
    "name": "Google Scholar",
    "url": "https://scholar.google.com/scholar?inst=9826951226383184939&as_q=",
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/200px-Google_%22G%22_Logo.svg.png",
    mapping: function mapping(queries, filters) {
        try {
            return queries.map(function (part) {
                return part.split(",")[2] || "";
            }).join(' ');
        } catch (e) {
            return '';
        }
    }
}]);

/**
 * Collapse institution list in full record
 */

app.controller('institutionToggleController', ['$location', '$http', '$scope', '$compile', '$element', function ($location, $http, $scope, $compile, $element) {
    var vm = this;

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
    var rootScope = $scope.$root;
    var uSMS = rootScope.$$childHead.$ctrl.userSessionManagerService;
    var jwtData = uSMS.jwtUtilService.getDecodedToken();
    var itemData = $scope.$parent.$parent.$parent.$parent.$ctrl.item;
    vm.visible = function () {
        if (jwtData.userName == null) {
            if (itemData.delivery.availability[0] != "available_in_my_institution" && itemData.delivery.availability[0] != "available_in_maininstitution" && itemData.delivery.availability[0] != "available_in_institution") {
                return true;
            }
        }
    };
    angular.element(document).ready(function () {
        jQuery("prm-alma-more-inst prm-authentication button span").text("Get it through CSU+ (2-5 days for delivery)");
    });
}]);

app.component('prmAlmaMoreInstAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'institutionToggleController',
    templateUrl: 'custom/01CALS_USM/html/prmAlmaMoreInstAfter.html'
});
/**
 * Show logged in user's name under Sign Out
*/
app.component('prmAuthenticationAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: function controller($compile, $scope, $templateCache, $element) {
        var vm = this;
        var loginServ = vm.parentCtrl.loginService;
        vm.$onInit = function () {
            loginServ.normalizeTargetUrl = function () {
                // Certain characters don't go through all Identity Providers.
                var sanitize = function sanitize(input) {
                    if (input && typeof input == "string") {
                        return input.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/{/g, '%7B').replace(/}/g, '%7D').replace(/"/g, '%22');
                    } else {
                        return input;
                    }
                };
                var URL = decodeURIComponent(this.$location.absUrl());
                var fields = URL.split('?', 2);
                var returnURL = fields[0];
                if (fields.length > 1) {
                    returnURL = returnURL + '?';
                    // Note this.$state.params applies to the base page.
                    // this._toParams covers the case of a dialog/layer on top of the page.
                    angular.forEach(this._toParams, function (value, key) {
                        if (value) {
                            returnURL = returnURL + encodeURIComponent(sanitize(key)) + '=' + encodeURIComponent(sanitize(value)) + '&';
                        }
                    }, this);
                }
                return returnURL;
            };
        };
        $templateCache.put('components/search/topbar/userArea/authentication.html', '\n        <div class="md-fab-toolbar-wrapper">\n            <md-button ng-if="!$ctrl.isLoggedIn" ng-click="$ctrl.handleLogin();" aria-label="{{\'eshelf.signin.title\' | translate}}" class="button-with-icon zero-margin">\n              <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-in"></prm-icon>\n              <span>Sign-In for more options</span></span>\n            </md-button>\n            <md-button ng-if="$ctrl.isLoggedIn" ng-click="$ctrl.handleLogout(authenticationMethod)" aria-label="{{\'eshelf.signout.title.link\' | translate}}" class="button-with-icon zero-margin authentication-multiline">\n              <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-out"></prm-icon>\n              <div class="layout-align-center-start layout-column">\n                 <span translate="eshelf.signout.title.link"></span>\n                 <span>{{$ctrl.loginService.userSessionManagerService.jwtUtilService.getDecodedToken().userName}}</span>\n              </div>\n            </md-button>\n        </div>');
        $compile($element.parent())($scope);
    }
});
app.controller('prmExploreMainAfterController', function () {
    if (window.location.href.indexOf("csusmf1=exc_reviews") < 0) {
        var waitForElementToDisplay = function waitForElementToDisplay(selector, time) {
            if (document.querySelector(selector) != null) {
                var reviewFacetSelector = document.querySelectorAll('[aria-label*="persistent"]');
                for (var i = 0; i < reviewFacetSelector.length; i++) {
                    angular.element(reviewFacetSelector)[i].triggerHandler('click');
                    return;
                }
            } else {
                setTimeout(function () {
                    waitForElementToDisplay(selector, time);
                }, time);
            }
        };

        waitForElementToDisplay('prm-breadcrumbs div div div button prm-icon > md-icon', 1000);
    }
});

app.component('prmExploreMainAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmExploreMainAfterController'
});
app.controller('requestOptions', ['$location', '$httpParamSerializer', '$http', '$timeout', '$scope', function ($location, $httpParamSerializer, $http, $timeout, $scope) {

    var vm = this;

    vm.visible = function () {
        if (vm.parentCtrl.item.pnx.addata.ristype[0] == "BOOK" || vm.parentCtrl.item.pnx.addata.format[0] == "book") {
            if (vm.parentCtrl.service.scrollId == "getit1_1" || vm.parentCtrl.service.scrollId == "getit_link1_0" || vm.parentCtrl.service.scrollId == "getit_link2") {
                if (vm.parentCtrl.item.delivery.availability[0] != "available_in_institution" && vm.parentCtrl.item.delivery.availability[0] != "available_in_my_institution") {
                    var addDatanodeList = vm.parentCtrl.item.pnx.addata;

                    var openURLData = "";
                    Object.keys(addDatanodeList).forEach(function (item) {
                        openURLData += "&rft." + item + "=";
                        if (addDatanodeList[item][0] != "undefined") {
                            openURLData += addDatanodeList[item][0];
                        }
                    });

                    return openURLData;
                } else {
                    return false;
                }
            }
        }
    };

    vm.viewItVisible = function () {
        if (vm.parentCtrl.item.pnx.addata.genre[0] == "article" && vm.parentCtrl.service.scrollId == "getit_link1_0" && vm.parentCtrl.item.delivery.availability == "no_fulltext") {
            return true;
        }
    };

    vm.tocAva = function () {
        if (vm.parentCtrl.item.pnx.addata.ristype[0] == "BOOK") {
            if (vm.parentCtrl.item.pnx.links.linktotoc && (vm.parentCtrl.service.scrollId == "getit1_1" || vm.parentCtrl.service.scrollId == "getit_link1_0" || vm.parentCtrl.service.scrollId == "getit_link2")) {
                var tocData = vm.parentCtrl.item.pnx.links.linktotoc + '';
                var tocParts = tocData.split("$$");
                var tocURL = tocParts[1].slice(1);

                return tocURL;
            } else {
                return false;
            }
        }
    };
    console.log(vm.parentCtrl.item.pnx.addata);
}]);

app.component('prmFullViewServiceContainerAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'requestOptions',
    templateUrl: 'custom/01CALS_USM/html/prmFullViewServiceContainerAfter.html'
});

app.controller('prmLoginAlmaMashupAfterController', [function () {
    var vm = this;
}]);

app.component('prmLoginAlmaMashupAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmLoginAlmaMashupAfterController',
    templateUrl: 'custom/01CALS_USM/html/prmLoginAlmaMashupAfter.html'
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
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner" tabindex="0" role="banner">\n  <a href="https://biblio.csusm.edu/" id="inst-logo-link">\n  <img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/><br/>University Library</a></div>'
});

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
}

/* Begin prmMainMenuAfter */
app.component('prmMainMenuAfter', {
    bindings: { parentCtrl: '<' },
    controller: function controller($scope) {
        /* Add in Warning Note script */
        setTimeout(function () {
            var y = document.getElementsByTagName("script")[0];
            var z = document.createElement("script");
            z.type = "text/javascript";
            z.async = true;
            z.src = "https://biblio.csusm.edu/warningnote/warningnote.js.php"; // your url here!
            y.parentNode.insertBefore(z, y);
        }, 3000); // add note 3 seconds after main menu loads - modify to suit your environment
        /* End Warning Note */
    }
});
/* End prmMainMenuAfter */
// Enhance No Results tile
app.controller('prmNoSearchResultAfterController', [function () {
    var vm = this;
    vm.getSearchTerm = getSearchTerm;
    vm.pciSetting = vm.parentCtrl.searchStateService.searchObject.pcAvailability || '';
    function getSearchTerm() {
        return vm.parentCtrl.term;
    }
}]);

app.component('prmNoSearchResultAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'prmNoSearchResultAfterController',
    templateUrl: 'custom/01CALS_USM/html/prmNoSearchResultAfter.html'
});

app.controller('prmSearchResultListAfterController', ['$location', '$scope', function ($location, $scope) {
    var query = $location.search().query;
    var filter = $location.search().pfilter;

    this.visible = function () {
        if (($location.path() === "/search" || $location.path() === "/jsearch") && angular.element(document.querySelector('prm-no-search-result')).length === 0 && angular.element(document.querySelector('.results-count')).length > 0) return true;
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

/**
 * Show My Account and Sign In without extra click
 */

app.component('prmUserAreaAfter', {
    bindings: { parentCtrl: '<' },
    controller: function controller($compile, $scope, $templateCache, $element) {
        $templateCache.put('components/search/topbar/userArea/user-area.html', '\n        <div class="md-fab-toolbar-wrapper">\n            <md-toolbar hide-xs>\n                <md-fab-actions class="md-toolbar-tools zero-padding buttons-group">\n                    <prm-library-card-menu></prm-library-card-menu>\n                    <prm-authentication layout="flex" [is-logged-in]="$ctrl.userName().length > 0"></prm-authentication>\n                </md-fab-actions>\n            </md-toolbar>\n            <md-button class="mobile-menu-button zero-margin" aria-label="{{\'nui.aria.userarea.open\' | translate}}" (click)="$ctrl.enableMobileMenu()" style="min-width: 60px" hide-gt-xs>\n                <prm-icon [icon-type]="::$ctrl.topBarIcons.more.type" [svg-icon-set]="::$ctrl.topBarIcons.more.iconSet" [icon-definition]="::$ctrl.topBarIcons.more.icon"></prm-icon>\n            </md-button>\n        </div>\n        <md-button style="display: none !important;"></md-button>\n        <md-button style="display: none !important;"></md-button>');
        $compile($element.parent())($scope);
    }
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

app.value('reportProblem', {
    //general options
    enabled: true,
    enabledDefault: true,
    requireName: false,
    requireEmail: true,
    requireDesc: true,
    reportUrl: 'https://biblio.csusm.edu/primo/reporting_form/?',
    messageText: '',
    buttonText: 'Report a Problem',
    reportVendor: 'email',
    subject: 'Primo Issue',
    //email-specific options
    toEmail: 'ltid.csusm@gmail.com',
    //libanswers-specific options
    instid: '',
    quid: '',
    qlog: '',
    source: ''
});

//Automatic Search When Changing "Tabs"
//automatically change search scope new version DW 12/01/2018
app.component('prmTabsAndScopesSelectorAfter', {
    bindings: { parentCtrl: '<' },
    controller: function controller($scope) {
        setInterval(function () {
            function activateSearch() {
                setTimeout(function () {
                    //alert('test');
                    var advancedSearchCheck = document.body.innerHTML.toString().search('Add a new line');
                    if (advancedSearchCheck > -1) {
                        document.getElementsByClassName("button-confirm button-large button-with-icon md-button md-primoExplore-theme md-ink-ripple")[0].click();
                    } else {
                        document.getElementsByClassName("zero-margin button-confirm md-button md-primoExplore-theme")[0].click();
                    }
                }, 500);
            }

            var searchScopes = document.querySelectorAll('[id^="select_option_"]');

            var i;
            for (i = 0; i < searchScopes.length; i++) {
                searchScopes[i].onclick = function () {
                    var t = this.innerText;
                    var advancedSearchCheck = document.body.innerHTML.toString().search('Add a new line');
                    if (advancedSearchCheck > -1) {
                        if (t.indexOf('Relevance') < 0 || t.indexOf('Date-newest') < 0 || t.indexOf('Date-oldest') < 0 || t.indexOf('Author') < 0 || t.indexOf('Title') < 0) {
                            activateSearch();
                        }
                    } else {
                        if (t.indexOf('Everything') > -1 || t.indexOf('Books & More') > -1 || t.indexOf('CSUSM Collection') > -1 || t.indexOf('CSUSM Media Library') > -1 || t.indexOf('Hansen Curriculum Room') > -1 || t.indexOf('Juvenile Collection') > -1 || t.indexOf('Barahona Center Spanish') > -1 || t.indexOf('Articles+') > -1 || t.indexOf('CSU+') > -1) {
                            activateSearch();
                        }
                    }
                };
            }
        }, 500);
    }
});
//End Automatic Search When Changing "Tabs"

app.component('prmSearchBarAfter', {
    bindings: {
        parentCtrl: '<'
    },
    controller: 'SearchBarAfterController',
    template: '<div class="one-search"><md-button aria-label="OneSearch" ng-click="$ctrl.navigateToHomePage()"><img show-gt-xs hide-xs ng-src="custom/01CALS_USM/img/one-search/sanmarcos.png" alt="OneSearch"/></md-button></div><search-bar-sub-menu></search-bar-sub-menu>'
});

app.constant('searchBarSubMenuItems', [{
    name: "Databases",
    description: "Go to Library Databases",
    action: "https://biblio.csusm.edu/research_portal/databases",
    icon: {
        set: '',
        icon: ''
    },
    show_xs: true,
    cssClasses: 'button-over-light'
}, {
    name: "Research Guides",
    description: "Go to Research Guides",
    action: "https://biblio.csusm.edu/research/guides",
    icon: {
        set: '',
        icon: ''
    },
    show_xs: true,
    cssClasses: 'button-over-light'
}, {
    name: "Ask a Librarian",
    description: "Get help with your research",
    action: "https://biblio.csusm.edu/content/ask-librarian",
    icon: {
        set: '',
        icon: ''
    },
    cssClasses: 'button-over-light'
}, {
    name: "Course Reserves",
    description: "Find reserves for your classes",
    action: "https://biblio.csusm.edu/reserves/",
    icon: {
        set: '',
        icon: ''
    },
    cssClasses: 'button-over-light'
}, {
    name: "Library Hours",
    description: "View Library Hours",
    action: "https://biblio.csusm.edu/library-hours",
    icon: {
        set: '',
        icon: ''
    },
    cssClasses: 'button-over-light'
}]);
/** Bring back the scopes for basic searches **/
app.controller('SearchBarAfterController', ['angularLoad', function (angularLoad) {
    var vm = this;
    vm.parentCtrl.showTabsAndScopes = true;
}]);

/** END Bring back the scopes for basic searches **/

(function () {
    var lc = document.createElement('script');lc.type = 'text/javascript';lc.async = 'true';
    lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'libtechproj.csusm.edu/s/8bc1910db6fa4ab0ff51b8b0bdf9e546-T/ehi5g1/78000/b6b48b2829824b869586ac216d119363/2.0.26/_/download/batch/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector/com.atlassian.jira.collector.plugin.jira-issue-collector-plugin:issuecollector.js?locale=en-US&collectorId=42c688b6';
    var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(lc, s);
})();
/** Altmetrics **/
app.controller('FullViewAfterController', ['angularLoad', '$http', '$scope', '$element', '$timeout', '$window', function (angularLoad, $http, $scope, $element, $timeout, $window) {
    var vm = this;
    this.$http = $http;
    this.$element = $element;
    this.$scope = $scope;
    this.$window = $window;

    vm.$onInit = function () //wait for all the bindings to be initialised
    {

        vm.parentElement = this.$element.parent()[0]; //the prm-full-view container

        try {
            vm.doi = vm.parentCtrl.item.pnx.addata.doi[0] || '';
        } catch (e) {
            return;
        }

        if (vm.doi) {
            //If we've got a doi to work with check whether altmetrics has data for it.
            //If so, make our div visible and create a new Altmetrics service
            $timeout(function () {
                $http.get('https://api.altmetric.com/v1/doi/' + vm.doi).then(function () {
                    try {
                        //Get the altmetrics widget
                        angularLoad.loadScript('https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js?' + Date.now()).then(function () {});
                        //Create our new Primo service
                        var altmetricsSection = {
                            scrollId: "altmetrics",
                            serviceName: "altmetrics",
                            title: "brief.results.tabs.Altmetrics"
                        };
                        vm.parentCtrl.services.splice(vm.parentCtrl.services.length, 0, altmetricsSection);
                    } catch (e) {}
                }).catch(function (e) {
                    return;
                });
            }, 3000);
        }
        //move the altmetrics widget into the new Altmetrics service section
        var unbindWatcher = this.$scope.$watch(function () {
            return vm.parentElement.querySelector('h4[translate="brief.results.tabs.Altmetrics"]');
        }, function (newVal, oldVal) {
            if (newVal) {
                //Get the section body associated with the value we're watching
                var altContainer = newVal.parentElement.parentElement.parentElement.parentElement.children[1];
                var almt1 = vm.parentElement.children[1].children[0];
                if (altContainer && altContainer.appendChild && altm1) {
                    altContainer.appendChild(altm1);
                }
                unbindWatcher();
            }
        });
    }; // end of $onInit
    //You'd also need to look at removing the various css/js scripts loaded by this.
    //refer to: https://github.com/Det-Kongelige-Bibliotek/primo-explore-rex
    vm.$onDestroy = function () {
        if (this.$window._altmetric) {
            delete this.$window._altmetric;
        }
        if (this.$window._altmetric_embed_init) {
            delete this.$window._altmetric_embed_init;
        }
        if (this.$window.AltmetricTemplates) {
            delete this.$window.AltmetricTemplates;
        }
    };
}]);

app.component('prmFullViewAfter', {
    bindings: { parentCtrl: '<' },
    controller: 'FullViewAfterController',
    template: '<div id="altm1" ng-if="$ctrl.doi" class="altmetric-embed" data-hide-no-mentions="true"  data-link-target="new" data-badge-type="medium-donut" data-badge-details="right" data-doi="{{$ctrl.doi}}"></div>'
});
/** Altmetrics **/
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
        var docTitle = "OneSearch";
    }
    var openURLDisplayPath = "openurl";
    var itemTitleText = "";

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
    // Updates the tracker to use `navigator.sendBeacon` if available.
    ga('send', 'event', {
        eventCategory: event,
        eventAction: 'click',
        eventLabel: event
    });
    if (apath.indexOf(openURLDisplayPath) !== -1 || apath.indexOf(fullDisplayPath) !== -1) {
        var interval = $interval(function () {
            if (angular.element(document.querySelector('prm-full-view-service-container')).length === 0) {
                return;
            }
            var itemTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a'));
            var itemTitleText = itemTitle.text();
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
            ga('set', 'page', rpath);
            ga('set', 'title', document.title);
            ga('send', 'pageview');
            $interval.cancel(interval);
        }, 0);
    } else {
        if (document.title.length === 0) {
            var docTitle = "OneSearch";
        }

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
                    ga('set', 'referrer', fromState);
                    ga('set', 'page', rpath);
                    ga('set', 'title', itemTitleText);
                    ga('send', 'pageview');
                    $interval.cancel(interval);
                }, 0);
            } else {
                ga('set', 'referrer', fromState);
                ga('set', 'page', rpath);
                ga('set', 'title', document.title);
                ga('send', 'pageview');
            }
        }
    });
});

/** Google Analytics **/

angular.module('externalSearch', []).value('searchTargets', []).component('prmFacetAfter', {
    bindings: { parentCtrl: '<' },
    controller: ['externalSearchService', function (externalSearchService) {
        externalSearchService.controller = this.parentCtrl;
        externalSearchService.addExtSearch();
    }]
}).component('prmPageNavMenuAfter', {
    controller: ['externalSearchService', function (externalSearchService) {
        if (externalSearchService.controller) externalSearchService.addExtSearch();
    }]
}).component('prmFacetExactAfter', {
    bindings: { parentCtrl: '<' },
    template: '\n      <div ng-if="name === \'External Search\'">\n          <div ng-hide="$ctrl.parentCtrl.facetGroup.facetGroupCollapsed">\n              <div class="section-content animate-max-height-variable" id="external-search">\n                  <div class="md-chips md-chips-wrap">\n                      <div ng-repeat="target in targets" aria-live="polite" class="md-chip animate-opacity-and-scale facet-element-marker-local4">\n                          <div class="md-chip-content layout-row" role="button" tabindex="0">\n                              <strong dir="auto" title="{{ target.name }}">\n                                  <a ng-href="{{ target.url + target.mapping(queries, filters) }}" target="_blank">\n                                      <img ng-src="{{ target.img }}" width="22" height="22"/> {{ target.name }}\n                                  </a>\n                              </strong>\n                          </div>\n                      </div>\n                  </div>\n              </div>\n          </div>\n      </div>',
    controller: ['$scope', '$location', 'searchTargets', function ($scope, $location, searchTargets) {
        $scope.name = this.parentCtrl.facetGroup.name;
        $scope.targets = searchTargets;
        var query = $location.search().query;
        var filter = $location.search().pfilter;
        $scope.queries = Array.isArray(query) ? query : query ? [query] : false;
        $scope.filters = Array.isArray(filter) ? filter : filter ? [filter] : false;
    }]
}).factory('externalSearchService', function () {
    return {
        get controller() {
            return this.prmFacetCtrl || false;
        },
        set controller(controller) {
            this.prmFacetCtrl = controller;
        },
        addExtSearch: function addExtSearch() {
            if (this.prmFacetCtrl.facetService.results[0].name !== 'External Search') {
                this.prmFacetCtrl.facetService.results.unshift({
                    name: 'External Search',
                    displayedType: 'exact',
                    limitCount: 0,
                    facetGroupCollapsed: false,
                    values: undefined
                });
            }
        }
    };
});

'use strict';

var searchBarSubMenuTemplate = '<div class="layout-align-begin-left layout-row flex search-bar-sub-menu">\n  <ul>\n    <li ng-repeat="item in items">\n    <button data-href="{{ translate(item.action) }}" aria-label="{{ translate(item.description) }}" ng-click="goToUrl(translate(item.action))" class="button-with-icon zero-margin md-button md-small {{item.cssClasses}}" type="button">\n      <md-tooltip md-direction="bottom" md-delay="500">{{ translate(item.description) }}</md-tooltip><prm-icon style="z-index:1" icon-type="svg" svg-icon-set="{{item.icon.set}}" icon-definition="{{item.icon.icon}}"></prm-icon>\n      <span class="search-bar-sub-menu-item" ng-class="(item.show_xs) ? \'\' : \'hide-xs\'">{{ translate(item.name) }}</span>\n    </button>\n    </li>\n  </ul>\n</div>\n';

angular.module('searchBarSubMenu', []).controller('searchBarSubMenuController', ['searchBarSubMenuItems', '$scope', '$filter', function (items, $scope, $filter) {
    this.$onInit = function () {
        $scope.items = items;
    };
    $scope.translate = function (original) {
        return original.replace(/\{(.+)\}/g, function (match, p1) {
            return $filter('translate')(p1);
        });
    };
    $scope.goToUrl = function (url) {
        window.open(url, '_blank');
    };
}]).component('searchBarSubMenu', {
    controller: 'searchBarSubMenuController',
    template: searchBarSubMenuTemplate
});
'use strict';

angular.module('reportProblem', []);

angular.module('reportProblem').component('ocaReportProblem', {
    bindings: {
        messageText: '@',
        buttonText: '@',
        reportUrl: '@',
        reportVendor: '@',
        parentCtrl: '<'
    },
    require: {
        itemCtrl: '^prmFullViewServiceContainer'
    },
    template: '\n    <div class="bar filter-bar layout-align-center-center layout-row margin-top-medium" layout="row" layout-align="center center">\n      <span class="margin-right-small">{{$ctrl.messageText}}</span>\n      <button class="button-with-icon zero-margin md-button md-button-raised md-primoExplore-theme" type="button" aria-label="Report a Problem" ng-click="$ctrl.showReportForm()">\n        <prm-icon icon-type="svg" svg-icon-set="action" icon-definition="ic_report_problem_24px"></prm-icon>\n        <span>{{$ctrl.buttonText}}</span>\n      </button>\n    </div>\n    <div class="alert-panel" ng-show="successMessagebool">\n      <div class="alert-message">\n        Submitted Successfully\n        <button class="md-button md-primoExplore-theme md-ink-ripple" type="button" ng-click="$ctrl.ok()"><span>DISMISS</span><div class="md-ripple-container"></div></button>\n      </div>\n    </div>\n    <div ng-if="$ctrl.showRPForm" class="send-actions-content-item report-problem-form-wrapper" layout="row">\n      <md-content layout-wrap layout-padding layout-fill>\n        <form name="$ctrl.reportForm" novalidate layout="column" layout-align="center center" (submit)="$ctrl.submitReport();">\n          <div layout="row" class="layout-full-width" layout-align="center center">\n            <div flex="10" flex-sm="5" hide-xs></div>\n            <div class="form-focus service-form" layout-padding flex>\n              <div layout-margin>\n                <div layout="column">\n                  <h4 class="md-subhead">Report a Problem</h4>\n                  <md-input-container class="underlined-input" ng-if="!$ctrl.requireName">\n                    <label>Name:</label>\n                    <input ng-model="$ctrl.name" name="name" type="text" >\n                  </md-input-container>\n                  <md-input-container class="underlined-input md-required" ng-if="$ctrl.requireEmail">\n                    <label>Email:</label>\n                    <input ng-model="$ctrl.email" name="email" type="text" required >\n                    <div ng-messages="reportForm.email.$error">\n                      <div ng-message="pattern, required ">email is invalid</div>\n                    </div>\n                  </md-input-container>\n                  <md-input-container class="underlined-input">\n                    <label>Phone:</label>\n                    <input ng-model="$ctrl.phoneNumber" name="phoneNumber" type="text" >\n                    <div ng-messages="reportForm.phoneNumber.$error">\n                      <div ng-message="pattern">please enter your phone number</div>\n                  </md-input-container>\n                  <md-input-container class="md-required" ng-if="$ctrl.requireDesc">\n                    <label>Description:</label>\n                    <textarea ng-model="$ctrl.description" name="description" required></textarea>\n                    <div ng-messages="reportForm.description.$error">\n                      <div ng-message="required">please enter your problem description</div>\n                    </div>\n                  </md-input-container>\n                  <md-input-container ng-if="!$ctrl.requireDesc">\n                    <label>Description:</label>\n                    <textarea ng-model="$ctrl.description" name="description"></textarea>\n                  </md-input-container>\n                  <md-input-container class="underlined-input" ng-if="$ctrl.isCaptcha">\n                    <div vc-recaptcha key="$ctrl.getCaptchaPublicKey()" on-success="$ctrl.setResponse(response)"></div>\n                    <span class="recaptcha-error-info" ng-show="smsForm.$submitted && ($ctrl.statusCode != 200 || smsForm.recaptchaResponse.$invalid || smsForm.$error.recaptcha.length)">\n                      <span translate="captcha.notselected"></span>\n                    </span>\n                  </md-input-container>\n                </div>\n              </div>\n            </div>\n            <div flex="20" flex-sm="10" hide-xs></div>\n          </div>\n          <div layout="row">\n            <div layout="row" layout-align="center" layout-fill>\n              <md-button type="submit" class="button-with-icon button-large button-confirm" aria-label="Submit Report">\n                <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="send"></prm-icon>\n                <span translate="report"></span>\n              </md-button>\n            </div>\n          </div>\n        </form>\n      </md-content>\n    </div>\n  ',
    controller: ['$location', '$httpParamSerializer', '$http', 'reportProblem', 'reportProblemDefault', '$timeout', '$scope', function ($location, $httpParamSerializer, $http, reportProblem, reportProblemDefault, $timeout, $scope) {
        var _this = this;

        this.enabled = reportProblem.hasOwnProperty("enabled") ? reportProblem.enabled : reportProblemDefault.enabled;
        this.requireName = reportProblem.hasOwnProperty("requireName") ? reportProblem.requireName : reportProblemDefault.requireName;
        this.requireEmail = reportProblem.hasOwnProperty("requireEmail") ? reportProblem.requireEmail : reportProblemDefault.requireEmail;
        this.requireDesc = reportProblem.hasOwnProperty("requireDesc") ? reportProblem.requireDesc : reportProblemDefault.requireDesc;
        this.format = reportProblem.hasOwnProperty("format") ? reportProblem.format : reportProblemDefault.format;
        this.messageText = this.messageText || (reportProblem.hasOwnProperty("messageText") ? reportProblem.messageText : reportProblemDefault.messageText);
        this.buttonText = this.buttonText || (reportProblem.hasOwnProperty("buttonText") ? reportProblem.buttonText : reportProblemDefault.buttonText);
        this.reportUrl = this.reportUrl || (reportProblem.hasOwnProperty("reportUrl") ? reportProblem.reportUrl : reportProblemDefault.reportUrl);
        this.reportVendor = this.reportVendor || (reportProblem.hasOwnProperty("reportVendor") ? reportProblem.reportVendor : reportProblemDefault.reportVendor);
        this.showLocations = ['/fulldisplay', '/openurl'];
        this.$onInit = function () {
            this.targetUrl = this.reportUrl + $httpParamSerializer($location.search());
            this.show = this.showLocations.includes($location.path()) && this.enabled === true;
            this.name = this.email = this.phoneNumber = this.description = this.gCaptchaResponse = this.statusMessage = '';
            this.telRegEx = /^\d{3}( |-)?\d{3}( |-)?\d{4}$/;
            this.emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // see http://emailregex.com/
            this.statusCode = 200;
            this.showRPForm = false;
        };
        this.validate = function () {
            return (_this.requireName ? _this.name : true) && (_this.requireEmail ? _this.emailRegEx.test(_this.email) : true) && (_this.requireDesc ? _this.description : true) && (_this.isCaptcha ? _this.gCaptchaResponse : true);
        };
        this.isCaptcha = window.appConfig['system-configuration']['Activate Captcha [Y/N]'] == 'Y';
        this.getCaptchaPublicKey = function () {
            return window.appConfig['system-configuration']['Public Captcha Key'];
        };
        this.setResponse = function (response) {
            return _this.gCaptchaResponse = response;
        };
        this.setStatusCode = function (code) {
            return _this.statusCode = code;
        };
        this.setStatusMessage = function (message) {
            return _this.statusMessage = message;
        };
        this.showReportForm = function () {
            return _this.showRPForm = !_this.showRPForm;
        };
        this.ok = function () {
            $scope.successMessagebool = false;
        };

        this.submitReport = function () {
            if (_this.validate()) {
                var params = {
                    'reportVendor': _this.reportVendor,
                    'format': _this.format,
                    'subject': reportProblem.hasOwnProperty("subject") ? reportProblem.subject : reportProblemDefault.subject,
                    'name': _this.name,
                    'email': _this.email,
                    'phone': _this.phoneNumber,
                    'description': _this.description,
                    'gCaptchaResponse': _this.gCaptchaResponse,
                    'urlBase': $location.protocol() + '://' + $location.host() + ($location.port() != 80 ? ':' + $location.port() : '') + '/primo-explore' + $location.path(),
                    'urlParams': $location.search(),
                    'item': _this.itemCtrl.item
                };
                if (_this.reportVendor === 'libanswers') {
                    params.action = 'libanswers';
                    params.instid = reportProblem.hasOwnProperty("instid") ? reportProblem.instid : reportProblemDefault.instid;
                    params.quid = reportProblem.hasOwnProperty("quid") ? reportProblem.quid : reportProblemDefault.quid;
                    params.qlog = reportProblem.hasOwnProperty("qlog") ? reportProblem.qlog : reportProblemDefault.qlog;
                    params.source = reportProblem.hasOwnProperty("source") ? reportProblem.source : reportProblemDefault.source;
                } else if (_this.reportVendor === 'email') {
                    params.action = 'problem-email';
                    params.to = reportProblem.hasOwnProperty("to") ? reportProblem.to : reportProblemDefault.to;
                }
                $http.post(_this.reportUrl, params).then(function (msg) {
                    _this.setStatusCode(msg.status);
                    _this.setStatusMessage(msg.statusText);
                    $scope.successMessage = "Submitted successfully";
                    $scope.successMessagebool = true;
                    $scope.successMessagebool = true;
                    $timeout(function () {
                        $scope.successMessagebool = false;
                    }, 8000);
                }).catch(function (err) {
                    _this.setStatusCode(err.status);
                    _this.setStatusMessage(err.statusText);
                    _this.setResponse('');
                    if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
                    alert('report sending failed');
                }).finally(function () {
                    if (_this.statusCode == 200) {
                        _this.name = _this.email = _this.phoneNumber = _this.description = _this.gCaptchaResponse = _this.statusMessage = '';
                        _this.reportForm.$setPristine();
                        _this.reportForm.$setUntouched();
                        _this.showReportForm();
                    }
                });
            }
        };
    }]
}).run(['$templateCache', 'reportProblem', 'reportProblemDefault', function ($templateCache, reportProblem, reportProblemDefault) {
    if (reportProblem.hasOwnProperty("enabledDefault") ? reportProblem.enabledDefault : reportProblemDefault.enabledDefault) {
        $templateCache.put('components/search/fullView/fullViewServiceContainer/full-view-service-container.html', $templateCache.get('components/search/fullView/fullViewServiceContainer/full-view-service-container.html').replace('<prm-login-alma-mashup', '<oca-report-problem ng-if="$ctrl.index == 1 && $ctrl.service.serviceName===\'activate\'" parent-ctrl="$ctrl"></oca-report-problem><prm-login-alma-mashup') // get/view it
        .replace('<prm-full-view-service-container-after', '<oca-report-problem ng-if="$ctrl.index == 1 && $ctrl.service.serviceName!==\'activate\'" parent-ctrl="$ctrl"></oca-report-problem><prm-full-view-service-container-after'));
        // everything else catch-all
    }
}]);

angular.module('reportProblem').value('reportProblem', {}).value('reportProblemDefault', {
    enabled: false,
    enabledDefault: true,
    requireName: false,
    requireEmail: true,
    requireDesc: true,
    format: 'html', //html | plaintext | markdown
    reportUrl: 'https://library.calstate.edu/primo-gateway/',
    reportVendor: 'email',
    messageText: 'See something that doesn\'t look right?',
    buttonText: 'Report a Problem',
    subject: 'Problem report',
    to: '',
    from: 'donotreply@calstate.edu',
    instid: '',
    quid: '',
    qlog: '',
    source: ''
});
})();