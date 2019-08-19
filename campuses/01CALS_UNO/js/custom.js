(function() {
"use strict";
'use strict';

//var app = angular.module('viewCustom', ['angularLoad']);
//changed to add SMS, Problem Report form, and multiple Analytics from Central Package (code included below)
//this file updated October 12 2018 to conform with Central Package release 2.1
	
var app = angular.module('viewCustom', ['sendSms', 'reportProblem', 'multipleAnalytics', 'angularLoad']);
	
//configure the SMS app
  app.constant('smsOptions', {
      enabled: true,
      index: 9,
      label: 'text'
    });
//Begin D. Walker's custom actions module
angular.module('customActions', []);

/* eslint-disable max-len */
angular.module('customActions').component('customAction', {
  bindings: {
    name: '@',
    label: '@',
    icon: '@',
    iconSet: '@',
    link: '@',
    index: '<'
  },
  require: {
    prmActionCtrl: '^prmActionList'
  },
  controller: ['customActions', function (customActions) {
    var _this = this;

    this.$onInit = function () {
      _this.action = {
        name: _this.name,
        label: _this.label,
        index: _this.index,
        icon: {
          icon: _this.icon,
          iconSet: _this.iconSet,
          type: 'svg'
        },
        onToggle: customActions.processLinkTemplate(_this.link, _this.prmActionCtrl.item)
      };
      customActions.addAction(_this.action, _this.prmActionCtrl);
    };
    this.$onDestroy = function () {
      return customActions.removeAction(_this.action, _this.prmActionCtrl);
    };
  }]
});

/* eslint-disable max-len */
angular.module('customActions').factory('customActions', function () {
  return {
    /**
     * Adds an action to the actions menu, including its icon.
     * @param  {object} action  action object
     * @param  {object} ctrl    instance of prmActionCtrl
     */
    // TODO coerce action.index to be <= requiredActionsList.length
    addAction: function addAction(action, ctrl) {
      if (!this.actionExists(action, ctrl)) {
        this.addActionIcon(action, ctrl);
        ctrl.actionListService.requiredActionsList.splice(action.index, 0, action.name);
        ctrl.actionListService.actionsToIndex[action.name] = action.index;
        ctrl.actionListService.onToggle[action.name] = action.onToggle;
        ctrl.actionListService.actionsToDisplay.unshift(action.name);
      }
    },
    /**
     * Removes an action from the actions menu, including its icon.
     * @param  {object} action  action object
     * @param  {object} ctrl    instance of prmActionCtrl
     */
    removeAction: function removeAction(action, ctrl) {
      if (this.actionExists(action, ctrl)) {
        this.removeActionIcon(action, ctrl);
        delete ctrl.actionListService.actionsToIndex[action.name];
        delete ctrl.actionListService.onToggle[action.name];
        var i = ctrl.actionListService.actionsToDisplay.indexOf(action.name);
        ctrl.actionListService.actionsToDisplay.splice(i, 1);
        i = ctrl.actionListService.requiredActionsList.indexOf(action.name);
        ctrl.actionListService.requiredActionsList.splice(i, 1);
      }
    },
    /**
     * Registers an action's icon.
     * Called internally by addAction().
     * @param  {object} action  action object
     * @param  {object} ctrl    instance of prmActionCtrl
     */
    addActionIcon: function addActionIcon(action, ctrl) {
      ctrl.actionLabelNamesMap[action.name] = action.label;
      ctrl.actionIconNamesMap[action.name] = action.name;
      ctrl.actionIcons[action.name] = action.icon;
    },
    /**
     * Deregisters an action's icon.
     * Called internally by removeAction().
     * @param  {object} action  action object
     * @param  {object} ctrl    instance of prmActionCtrl
     */
    removeActionIcon: function removeActionIcon(action, ctrl) {
      delete ctrl.actionLabelNamesMap[action.name];
      delete ctrl.actionIconNamesMap[action.name];
      delete ctrl.actionIcons[action.name];
    },
    /**
     * Check if an action exists.
     * Returns true if action is part of actionsToIndex.
     * @param  {object} action  action object
     * @param  {object} ctrl    instance of prmActionCtrl
     * @return {bool}
     */
    actionExists: function actionExists(action, ctrl) {
      return ctrl.actionListService.actionsToIndex.hasOwnProperty(action.name);
    },
    /**
     * Process a link into a function to call when the action is clicked.
     * The function will open the processed link in a new tab.
     * Will replace {pnx.xxx.xxx} expressions with properties from the item.
     * @param  {string}    link    the original link string from the html
     * @param  {object}    item    the item object obtained from the controller
     * @return {function}          function to call when the action is clicked
     */
    processLinkTemplate: function processLinkTemplate(link, item) {
      var processedLink = link;
      var pnxProperties = link.match(/\{(pnx\..*?)\}/g) || [];
      pnxProperties.forEach(function (property) {
        var value = property.replace(/[{}]/g, '').split('.').reduce(function (o, i) {
          try {
            var h = /(.*)(\[\d\])/.exec(i);
            if (h instanceof Array) {
              return o[h[1]][h[2].replace(/[^\d]/g, '')];
            }
            return o[i];
          } catch (e) {
            return '';
          }
        }, item);
        processedLink = processedLink.replace(property, value);
      });
      return function () {
        return window.open(processedLink, '_blank');
      };
    }
  };
});
//End D. Walker's Custom Actions module
	
//Begin D. Walker's SMS module

angular.module('sendSms', ['ngMaterial', 'primo-explore.components', 'customActions']);

angular.module('sendSms').component('ocaSendSms', {
  bindings: {
    item: '<',
    finishedSmsEvent: '&'
  },
  template: `
  <div class="send-actions-content-item" layout="row">
    <md-content layout-wrap layout-padding layout-fill>
      <form name="smsForm" novalidate layout="column" layout-align="center center" (submit)="$ctrl.sendSms($event);">
        <div layout="row" class="layout-full-width" layout-align="center center">
          <div flex="20" flex-sm="10" hide-xs></div>
          <div class="form-focus service-form" layout-padding flex>
            <div layout-margin>
              <div layout="column">
                <h4 class="md-subhead">Standard message and data rates may apply.</h4>
                <md-input-container class="underlined-input md-required">
                  <label>Phone number:</label>
                  <input ng-model="$ctrl.phoneNumber" name="phoneNumber" type="text" required ng-pattern="::$ctrl.telRegEx">
                  <div ng-messages="smsForm.phoneNumber.$error">
                    <div ng-message="pattern, required ">phone number is invalid</div>
                  </div>
                </md-input-container>
                <md-input-container class="md-required">
                  <label>Carrier:</label>
                  <md-select ng-model="$ctrl.carrier" name="carrier" placeholder="Select a carrier" required>
                    <md-option ng-repeat="(carrier, address) in $ctrl.carriers" value="{{ address }}">
                      {{ carrier }}
                    </md-option>
                  </md-select>
                  <div ng-messages="smsForm.carrier.$error">
                    <div ng-message="required">please select a carrier</div>
                  </div>
                </md-input-container>
                <md-input-container class="underlined-input" ng-if="$ctrl.isCaptcha">
                  <div vc-recaptcha key="$ctrl.getCaptchaPublicKey()" on-success="$ctrl.setResponse(response)"></div>
                  <span class="recaptcha-error-info" ng-show="smsForm.$submitted && ($ctrl.statusCode != 200 || smsForm.recaptchaResponse.$invalid || smsForm.$error.recaptcha.length)">
                    <span translate="captcha.notselected"></span>
                  </span>
                </md-input-container>
                <md-input-container class="underlined-input" ng-show="$ctrl.statusCode != 200">
                  <span class="recaptcha-error-info" ng-show="$ctrl.statusCode != 200">
                    <span>{{$ctrl.statusMessage}}</span>
                  </span>
                </md-input-container>
              </div>
            </div>
          </div>
          <div flex="20" flex-sm="10" hide-xs></div>
        </div>
        <div layout="row">
          <div layout="row" layout-align="center" layout-fill>
            <md-button type="submit" class="button-with-icon button-large button-confirm" aria-label="Send the result by SMS">
              <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="send"></prm-icon>
              <span translate="email.popup.link.send"></span>
            </md-button>
          </div>
        </div>
      </form>
    </md-content>
  </div>
  <oca-send-sms-after parent-ctrl="$ctrl"></oca-send-sms-after>
  `,
 controller: ['$http', 'smsCarriers', 'smsCarriersDefault', 'smsOptions', 'smsOptionsDefault', function ($http, smsCarriers, smsCarriersDefault, smsOptions, smsOptionsDefault) {
    var _this = this;

    this.noPrintFoundLabel = smsOptions.hasOwnProperty("noPrintFoundLabel") ? smsOptions.noPrintFoundLabel : smsOptionsDefault.noPrintFoundLabel;
    this.$onInit = function () {
      _this.carriers = angular.equals(smsCarriers, {}) ? smsCarriersDefault : smsCarriers;
      _this.carrier = _this.phoneNumber = _this.gCaptchaResponse = _this.statusMessage = '';
      _this.telRegEx = /^\d{3}( |-)?\d{3}( |-)?\d{4}$/;
      _this.statusCode = 200;
    };
    this.validate = function () {
      return _this.telRegEx.test(_this.phoneNumber) && _this.carrier && (_this.isCaptcha ? _this.gCaptchaResponse : true);
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
    this.sendSms = function () {
      if (_this.validate()) {
        var message = "";
        var title = 'Title: ' + _this.item.pnx.display.title;
        if (_this.item.delivery.holding.length > 0) {
          var holdings = '';
          _this.item.delivery.holding.forEach(function (holding) {
            if (holding.organization == appConfig['primo-view']['institution']['institution-code']) {
              if (holdings != '') holdings += '<br><br>';
              holdings += 'Location: ' + holding.subLocation + '<br>';
              holdings += 'Call Number: ' + holding.callNumber + '<br>';
              holdings += 'Currently ' + holding.availabilityStatus;
            }
          });
          if (holdings == '') {
              holdings = _this.noPrintFoundLabel;
          }
          // make sure we don't exceed 160 (148 chars + stuff)
          if (title.length + holdings.length > 148) {
              title = title.substring(0,148 - holdings.length) + '...';
          }
          message = title + '<br><br>' + holdings;
          console.log("SMS length: " + message.length);
        } else message += _this.noPrintFoundLabel;
        $http.post(smsOptions.formUrl || smsOptionsDefault.formUrl, {
          "action": "sms",
          "from": smsOptions.fromEmail || smsOptionsDefault.fromEmail,
          "to": _this.phoneNumber + '@' + _this.carrier,
          "subject": smsOptions.subject || smsOptionsDefault.subject,
          "message": message,
          "gCaptchaResponse": _this.gCaptchaResponse
        }).then(function (msg) {
          _this.setStatusCode(msg.status);
          _this.setStatusMessage(msg.statusText);
          console.log('sms successfully sent', msg);
        }).catch(function (err) {
          _this.setStatusCode(err.status);
          _this.setStatusMessage(err.statusText);
          _this.setResponse('');
          if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
          console.error('sms sending failed', err);
        }).finally(function () {
          return _this.statusCode == 200 ? _this.finishedSmsEvent() : '';
        });
      }
    };
  }]
}).run(['$templateCache', 'smsAction', 'smsActionDefault', 'smsOptions', 'smsOptionsDefault', function ($templateCache, smsAction, smsActionDefault, smsOptions, smsOptionsDefault) {
  if (smsOptions.hasOwnProperty("enabled") ? smsOptions.enabled : smsOptionsDefault.enabled) {
    $templateCache.put('components/search/actions/actionContainer/action-container.html', '<oca-send-sms ng-if="($ctrl.actionName===\'' + (smsAction.name || smsActionDefault.name) + '\')" finished-sms-event="$ctrl.throwCloseTabsEvent()" item="::$ctrl.item"></oca-send-sms>' + $templateCache.get('components/search/actions/actionContainer/action-container.html'));
    $templateCache.put('components/search/actions/action-list.html', $templateCache.get('components/search/actions/action-list.html').replace('</md-nav-item>', '</md-nav-item><sms-action />'));
  }
}]);

angular.module('sendSms').component('smsAction', {
  require: {
    prmActionCtrl: '^prmActionList'
  },
  controller: ['customActions', 'smsAction', 'smsActionDefault', 'smsOptions', function (customActions, smsAction, smsActionDefault, smsOptions) {
    var _this2 = this;

    smsAction.name = smsOptions.name || smsActionDefault.name;
    smsAction.label = smsOptions.label || smsActionDefault.label;
    smsAction.index = smsOptions.index || smsActionDefault.index;
    smsAction.icon = smsOptions.icon || smsActionDefault.icon;

    this.$onInit = function () {
      return customActions.addAction(smsAction, _this2.prmActionCtrl);
    };
    this.$onDestroy = function () {
      return customActions.removeAction(smsAction, _this2.prmActionCtrl);
    };
  }]
});

angular.module('sendSms').value('smsAction', {}).value('smsActionDefault', {
  name: 'send_sms',
  label: 'Text',
  index: 9,
  icon: {
    icon: 'ic_smartphone_24px',
    iconSet: 'hardware',
    type: 'svg'
  }
}).value('smsCarriers', {}).value('smsCarriersDefault', {
  'ATT': 'sms.att.net',
  'Verizon': 'vtext.com',
  'Sprint': 'messaging.sprintpcs.com',
  'T-Mobile': 'tmomail.net',
  'Cricket': 'mms.mycricket.com',
  'Nextel': 'messaging.nextel.com',
  'Project Fi': 'msg.fi.google.com',
  'Qwest': 'qwestmp.com',
  'Virgin': 'vmobl.com'
}).value('smsOptions', {}).value('smsOptionsDefault', {
  enabled: false,
  formUrl: 'https://library.calstate.edu/primo-gateway/',
  fromEmail: 'do-not-respond@calstate.edu',
  subject: '',
  noPrintFoundLabel: 'No Print Locations'
});
//End SMS module

/****************************************************************************************************/

/*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

/*var app = angular.module('centralCustom', ['angularLoad']);*/

/****************************************************************************************************/

app.controller('prmLogoAfterController', [function() {
	var vm = this;
    vm.getIconLink = getIconLink;

    function getIconLink() {
		return vm.parentCtrl.iconLink;
    }
  }]);


//update template to include new URL for institution
app.component('prmLogoAfter', {
bindings: {
	parentCtrl: '<'
    },
controller: 'prmLogoAfterController',
template: '<div class="logo-container" layout="row" layout-fill><div class="flex-item"><a class="image-link" href="http://www.csun.edu"><img alt="CSUN" src="custom/01CALS_UNO/img/CSUN-Wordmark.png"/></a></div><div class="flex-item"><a class="image-link" href="https://csun-primo.hosted.exlibrisgroup.com/primo-explore/search?vid=01CALS_UNO"><img alt="Onesearch" src="custom/01CALS_UNO/img/CSUN-Onesearch.png"/></a></div></div>'
  });
  


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
    templateUrl: 'custom/CENTRAL_PACKAGE/html/prmAlmaMoreInstAfter.html'
});

/* Overwrite user area */
app.component('prmUserAreaAfter', {
     bindings: { parentCtrl: '<' },
    controller: function controller($compile, $scope, $templateCache, $element) {
        $templateCache.put('components/search/topbar/userArea/user-area.html', `
        <div class="md-fab-toolbar-wrapper">
            <md-toolbar hide-xs>
                <md-fab-actions class="md-toolbar-tools zero-padding buttons-group">
                    <prm-library-card-menu></prm-library-card-menu>
                    <prm-authentication layout="flex" [is-logged-in]="$ctrl.userName().length > 0"></prm-authentication>
                </md-fab-actions>
            </md-toolbar>
            <md-button class="mobile-menu-button zero-margin" aria-label="{{\'nui.aria.userarea.open\' | translate}}" (click)="$ctrl.enableMobileMenu()" style="min-width: 60px" hide-gt-xs>
                <prm-icon [icon-type]="::$ctrl.topBarIcons.more.type" [svg-icon-set]="::$ctrl.topBarIcons.more.iconSet" [icon-definition]="::$ctrl.topBarIcons.more.icon"></prm-icon>
            </md-button>
        </div>
        <md-button style="display: none !important;"></md-button>
        <md-button style="display: none !important;"></md-button>`);
        $compile($element.parent())($scope);
    }
});

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
    templateUrl: 'custom/01CALS_UNO/html/prmServiceDetailsAfter.html'
});

	

//begin D. Walker's Report a Problem module
	
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
  template: `
  <div ng-if="$ctrl.show" class="bar filter-bar layout-align-center-center layout-row margin-top-medium" layout="row" layout-align="center center">
    <span class="margin-right-small">{{$ctrl.messageText}}</span>
    <button class="button-with-icon zero-margin md-button md-button-raised md-primoExplore-theme" type="button" aria-label="Report a Problem" style="color: #5c92bd;" ng-click="$ctrl.showReportForm()">
      <prm-icon icon-type="svg" svg-icon-set="action" icon-definition="ic_report_problem_24px"></prm-icon>
      <span style="text-transform: none;">{{$ctrl.buttonText}}</span>
    </button>
  </div>
  <div ng-if="$ctrl.showRPForm" class="send-actions-content-item" layout="row">
    <md-content layout-wrap layout-padding layout-fill>
      <form name="$ctrl.reportForm" novalidate layout="column" layout-align="center center" (submit)="$ctrl.submitReport();">
        <div layout="row" class="layout-full-width" layout-align="center center">
          <div flex="20" flex-sm="10" hide-xs></div>
          <div class="form-focus service-form" layout-padding flex>
            <div layout-margin>
              <div layout="column">
                <h4 class="md-subhead">Report Your Problem here:</h4>
                <md-input-container class="underlined-input">
                  <label>Name:</label>
                  <input ng-model="$ctrl.name" name="name" type="text" >
                  <div ng-messages="reportForm.name.$error">
                    <div ng-message="required">please enter your name</div>
                  </div>
                </md-input-container>
                <md-input-container class="underlined-input md-required">
                  <label>Email:</label>
                  <input ng-model="$ctrl.email" name="email" type="text" required >
                  <div ng-messages="reportForm.email.$error">
                    <div ng-message="pattern, required ">email is invalid</div>
                  </div>
                </md-input-container>
                <md-input-container class="md-required">
                  <label>Description:</label>
                  <textarea ng-model="$ctrl.description" name="description" required></textarea>
                  <div ng-messages="reportForm.description.$error">
                    <div ng-message="required">please enter your problem description</div>
                  </div>
                </md-input-container>
                <md-input-container class="underlined-input" ng-if="$ctrl.isCaptcha">
                  <div vc-recaptcha key="$ctrl.getCaptchaPublicKey()" on-success="$ctrl.setResponse(response)"></div>
                  <span class="recaptcha-error-info" ng-show="smsForm.$submitted && ($ctrl.statusCode != 200 || smsForm.recaptchaResponse.$invalid || smsForm.$error.recaptcha.length)">
                    <span translate="captcha.notselected"></span>
                  </span>
                </md-input-container>
              </div>
            </div>
          </div>
          <div flex="20" flex-sm="10" hide-xs></div>
        </div>
        <div layout="row">
          <div layout="row" layout-align="center" layout-fill>
            <md-button type="submit" class="button-with-icon button-large button-confirm" aria-label="Submit Report">
              <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="send"></prm-icon>
              <span translate="report"></span>
            </md-button>
          </div>
        </div>
      </form>
    </md-content>
  </div>
  `,
  controller: ['$location', '$httpParamSerializer', '$http', 'reportProblem', 'reportProblemDefault', function ($location, $httpParamSerializer, $http, reportProblem, reportProblemDefault) {
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
      return (_this.requireName ? _this.name : true)
        && (_this.requireEmail ? _this.emailRegEx.test(_this.email) : true)
        && (_this.requireDesc ? _this.description : true)
        && (_this.isCaptcha ? _this.gCaptchaResponse : true);
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

   this.submitReport = function () {
      if (_this.validate()) {
        var params = {
          'reportVendor': _this.reportVendor,
          'format': _this.format,
          'subject': reportProblem.hasOwnProperty("subject") ? reportProblem.subject : reportProblemDefault.subject,
          'name': _this.name,
          'from': _this.email ? _this.email : (reportProblem.hasOwnProperty("from") ? reportProblem.from : reportProblemDefault.from),
          'phone': _this.phoneNumber,
          'description': _this.description,
          'gCaptchaResponse': _this.gCaptchaResponse,
          'urlBase': $location.protocol() + '://' + $location.host() + ($location.port() != 80 ? ':' + $location.port() : '') + '/primo-explore' + $location.path(),
          'urlParams': $location.search(),
          'item': _this.itemCtrl.item
        };
        params.subject = params.subject.replace(/\{(.+?)(?![^}])\}/g, function(match, p1) {
          function recurFind(data, stack) {
            if (data.indexOf('.') > -1) {
              var parts = data.split(/\.(.+)/);
              if (parts[1].indexOf('.') > -1) {
                var parts2 = parts[1].split(/\.(.+)/);
                if (stack.hasOwnProperty(parts[0]))
                  if (stack[parts[0]].hasOwnProperty(parts2[0]))
                    return recurFind(parts2[1], stack[parts[0]][parts2[0]]);
              } else if (stack.hasOwnProperty(parts[0]))
                if (stack[parts[0]].hasOwnProperty(parts[1]))
                  return stack[parts[0]][parts[1]];
            } else if(stack.hasOwnProperty(data))
              return stack[data];
            return false;
          }
          var rft = recurFind(p1, params.item.pnx);
          if(rft) return rft;
          return match;
        });
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
          console.log('report successfully sent', msg);
        }).catch(function (err) {
          _this.setStatusCode(err.status);
          _this.setStatusMessage(err.statusText);
          _this.setResponse('');
          if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
          console.error('report sending failed', err);
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
    $templateCache.put('components/search/fullView/fullViewServiceContainer/full-view-service-container.html', $templateCache.get('components/search/fullView/fullViewServiceContainer/full-view-service-container.html')
      .replace('</prm-login-alma-mashup>', '</prm-login-alma-mashup><oca-report-problem ng-if="$ctrl.index == 1 && $ctrl.service.serviceName===\'activate\'" parent-ctrl="$ctrl"></oca-report-problem>') // get/view it
      .replace('<prm-full-view-service-container-after', '<oca-report-problem ng-if="$ctrl.index == 1 && $ctrl.service.serviceName!==\'activate\'" parent-ctrl="$ctrl"></oca-report-problem><prm-full-view-service-container-after')); // everything else catch-all
  }
}]);

angular.module('reportProblem').value('reportProblem', {}).value('reportProblemDefault', {
  enabled: true,
  enabledDefault: true,
  requireName: false,
  requireEmail: true,
  requireDesc: true,
  format: 'html', //html | plaintext | markdown
  reportUrl: 'https://library.calstate.edu/primo-gateway/',
  reportVendor: 'email',
  messageText: 'See something that doesn\'t look right?',
  buttonText: 'Report a Problem',
  subject: 'OneSearch Problem report',
  to: 'libassist@csun.edu',
  from: 'donotreply@calstate.edu',
  instid: '',
  quid: '',
  qlog: '',
  source: ''
});
//end D. Walker's Report a problem module
	
//Begin D. Walker's amalytics module
	
app.constant('analyticsOptions', {
  enabled: true,
  siteSource: 'ga',
  siteId: 'UA-6381987-18',
  siteUrl: 'https://www.google-analytics.com/analytics.js',
  defaultTitle: 'CSUN OneSearch'
});
	
angular.module('multipleAnalytics', []);
angular.module('multipleAnalytics').run(function ($rootScope, $interval, analyticsOptions, analyticsOptionsDefault) {
    var enabled = analyticsOptions.hasOwnProperty("enabled") ? analyticsOptions.enabled : analyticsOptionsDefault.enabled;
    var siteSource = analyticsOptions.hasOwnProperty("siteSource") ? analyticsOptions.siteSource : analyticsOptionsDefault.siteSource;
    var siteId = analyticsOptions.hasOwnProperty("siteId") ? analyticsOptions.siteId : analyticsOptionsDefault.siteId;
    var siteUrl = analyticsOptions.hasOwnProperty("siteUrl") ? analyticsOptions.siteUrl : analyticsOptionsDefault.siteUrl;
    var defaultTitle = analyticsOptions.hasOwnProperty("defaultTitle") ? analyticsOptions.defaultTitle : analyticsOptionsDefault.defaultTitle;
  if(enabled) {
    if(siteId != '') {
      if(siteSource === 'ga') {
        if(typeof ga === 'undefined') {
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script',siteUrl,'ga');

          ga('create', siteId, {'alwaysSendReferrer': true});
          ga('set', 'anonymizeIp', true);
        }
      } else if(siteSource === 'matomo') {
        if(siteUrl != '') {
          if(typeof _paq === 'undefined') {
            window['_paq'] = [];
            _paq.push(["setDomains", ["*.csudh-primo.hosted.exlibrisgroup.com/"]]);
            _paq.push(["setDoNotTrack", true]);
            (function() {
              _paq.push(['setTrackerUrl', siteUrl+'piwik.php']);
              _paq.push(['setSiteId', siteId]);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.type='text/javascript'; g.async=true; g.defer=true; g.src=siteUrl+'piwik.js'; s.parentNode.insertBefore(g,s);
            })();
          }
        }
      }
    }
    $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
      if(siteSource != '') {
        var documentTitle = defaultTitle;
        var timerStart = Date.now();
        var interval = $interval(function () {
          if(document.title !== '') documentTitle = document.title;
          if (window.location.pathname.indexOf('openurl') !== -1 || window.location.pathname.indexOf('fulldisplay') !== -1)
            if (angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).length === 0) return;
            else documentTitle = angular.element(document.querySelector('prm-full-view-service-container .item-title>a')).text();

          if(siteSource === 'ga') {
            if(typeof ga !== 'undefined') {
              if(fromState != toState) ga('set', 'referrer', fromState);
              ga('set', 'location', toState);
              ga('set', 'title', documentTitle);
              ga('send', 'pageview');
            }
          } else if(siteSource === 'matomo') {
            if(typeof _paq !== 'undefined') {
              if(fromState != toState) _paq.push(['setReferrerUrl', fromState]);
              _paq.push(['setCustomUrl', toState]);
              _paq.push(['setDocumentTitle', documentTitle]);
              _paq.push(['setGenerationTimeMs', Date.now()-timerStart]);
              _paq.push(['enableLinkTracking']);
              _paq.push(['enableHeartBeatTimer']);
              _paq.push(['trackPageView']);
            }
          }
          $interval.cancel(interval);
        }, 0);
      }
    });
  }
});
angular.module('multipleAnalytics').value('analyticsOptions', {}).value('analyticsOptionsDefault', {
  enabled: false,
  siteSource: 'ga',
  siteId: '',
  siteUrl: 'https://www.google-analytics.com/analytics.js',
  defaultTitle: 'Discovery Search'
});
	
//End  D. Walker's analytics module
	
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
        vm.$onInit = function() {
            loginServ.normalizeTargetUrl = function() {
                // Certain characters don't go through all Identity Providers.
                var sanitize = function(input) {
                    if (input && typeof(input) == "string") {
                        return input
                            .replace(/</g, '%3C')
                            .replace(/>/g, '%3E')
                            .replace(/{/g, '%7B')
                            .replace(/}/g, '%7D')
                            .replace(/"/g, '%22');
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
                    angular.forEach(this._toParams, function(value, key) {
                        if (value) {
                            returnURL = returnURL + encodeURIComponent(sanitize(key)) + '=' +
                                encodeURIComponent(sanitize(value)) + '&';
                        }
                    }, this);
                }
                return returnURL;
            }
        };
        $templateCache.put('components/search/topbar/userArea/authentication.html', `
        <div class="md-fab-toolbar-wrapper">
            <md-button ng-if="!$ctrl.isLoggedIn" ng-click="$ctrl.handleLogin();" aria-label="{{\'eshelf.signin.title\' | translate}}" class="button-with-icon zero-margin">
              <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-in"></prm-icon>
              <span><span translate="eshelf.signin.title"></span></span></span>
            </md-button>
            <md-button ng-if="$ctrl.isLoggedIn" ng-click="$ctrl.handleLogout(authenticationMethod)" aria-label="{{\'eshelf.signout.title.link\' | translate}}" class="button-with-icon zero-margin authentication-multiline">
              <prm-icon icon-type="svg" svg-icon-set="primo-ui" icon-definition="sign-out"></prm-icon>
              <div class="layout-align-center-start layout-column">
                 <span translate="eshelf.signout.title.link"></span>
                 <span>{{$ctrl.loginService.userSessionManagerService.jwtUtilService.getDecodedToken().userName}}</span>
              </div>
            </md-button>
        </div>`);
        $compile($element.parent())($scope);
    }
});
	
	angular.module('broadcastdashboard', []);
	app.controller('prmSearchbarAfterController', ['$scope', '$http', 
		function ($scope, $http) {
			var onMessageComplete = function (response) {
				var message = response.data;
				var classes = (message.split('class="').pop());
				$scope.classes = (classes.split('"'))[0];
				message = (message.split("<p>").pop());
				message = (message.split("</p>"))[0];
				if (message == '<div class="feed-error">There is no current message set for broadcast.</div>') {
					$scope.bdmessage = '';
				} else if (message == '<div class="feed-error">The Broadcast Dashboard feed is disabled. Please contact your system administrator to enable it.</div>') {
					$scope.bdmessage = '';
				} else $scope.bdmessage = message;
			};
			$http.get("https://library.csun.edu/broadcast_dashboard_feed")
				.then(onMessageComplete);
			$scope.bdmessage = '';
			$scope.classes = '';
		}
		
	]);

	

	
})();

 
