(function() {
  "use strict";
  'use strict';


  /* var app = angular.module('viewCustom', ['angularLoad']);*/
  
  //var app = angular.module('viewCustom', ['sendSms','reportProblem','angularLoad']);
  
  var app = angular.module('viewCustom', ['sendSms','multipleAnalytics','angularLoad']);
  
  app.constant('smsOptions', {
	enabled: true,
	label: 'Text', // the label that appears under the icon
	index: 1 // position within the send-to list, first position = 0
  });
  
  app.constant('smsCarriers', {
	'ATT': 'txt.att.net',
	'Cricket': 'mms.mycricket.com',
	'Nextel': 'messaging.nextel.com',
	'Project Fi': 'msg.fi.google.com',
	'Qwest': 'qwestmp.com',
	'Sprint': 'messaging.sprintpcs.com',
	'T-Mobile': 'tmomail.net',
	'Verizon': 'vtext.com',
	'Virgin': 'vmobl.com'
  });
  
  app.constant('analyticsOptions', {
	  enabled: true,
	  siteSource: 'ga',
	  siteId: 'UA-5754660-11',
	  siteUrl: 'https://www.google-analytics.com/analytics.js',
	  defaultTitle: 'OneSearch'
   });
   
  /*
  app.constant('reportProblem', {
	  to: 'onesearchissue+du2w8adipuhgjvu1awkq@boards.trello.com',
	  enabled: true,
	  messageText: 'See something that doesn\'t look right?',  // text that appears before the link
	  buttonText: 'Report a Problem', // the portion of the text that is the link
	  subject: 'Problem report', // email subject line
  });
  */
 
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
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="https://library.csus.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

})();
