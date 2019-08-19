(function() {
  "use strict";
  'use strict';


  var app = angular.module('viewCustom', [/*'sendSms',*/'reportProblem', 'angularLoad']);

  /****************************************************************************************************/

  /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

  /*var app = angular.module('centralCustom', ['angularLoad']);*/

  /****************************************************************************************************/
/*
app.constant('smsOptions', {
  enabled: true
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
*/
app.constant('reportProblem', {
  to: 'magedanz@csusb.edu',
  enabled: true,
  messageText: 'See something that doesn\'t look right?',  // text that appears before the link
  buttonText: 'Report a Problem', // the portion of the text that is the link
  subject: 'Pfau Library Problem Report', // email subject line
});

  app.controller('prmLogoAfterController', [function() {
    var vm = this;
    vm.getIconLink = getIconLink;

    function getIconLink() {
      return vm.parentCtrl.iconLink;
    }
  }]);

//component to activate search when search scope 
app.component('prmTabsAndScopesSelectorAfter',{
      bindings: {parentCtrl: '<'},
       
      controller: function($scope){
                 setTimeout(function(){
                     function activateSearch(){
               setTimeout(function(){
                 document.getElementsByClassName("zero-margin button-confirm md-button md-primoExplore-theme")[0].click()
                 }, 500)
             }
                                 
                  var searchScopes = document.querySelectorAll('[id^="select_option_"]')
            for (var i in searchScopes){
                searchScopes[i].onclick = function(){
                                activateSearch();
        };
                       }
                              }, 500)
                             
                        }
                             
     });




  //update template to include new URL for institution
  app.component('prmLogoAfter', {
    bindings: {
      parentCtrl: '<'
    },
    controller: 'prmLogoAfterController',
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.csusb.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });


  //add libchat box
  var d=document.createElement('div');
  d.setAttribute("class", "libraryh3lp"); 
  d.setAttribute("data-lh3-jid", "pfau_library@chat.libraryh3lp.com");  
  var a = document.createElement('a');
  a.href="#";
  a.onclick = function(){window.open('http://library.csusb.edu/services/chatPRIMO.html', 'AskUs', 'resizable=1,width=400,height=600'); return false;};
  a.setAttribute("class", "md-primoExplore-theme");
  var i = document.createElement('img');
  i.src = "https://s3.amazonaws.com/libraryh3lp.com/us/buttons/ask-a-librarian/dark-blue-ask-a-librarian.png";
  i.alt= "Chat now";
  a.appendChild(i);
  d.appendChild(a);
  document.body.appendChild(d);
  //end libchat
/*setTimeout(function(){
  //Add Alert Option
  var alert = document.createElement('p');
  var text = document.createTextNode("Onesearch is down sorry for the inconvenince");
  alert.appendChild(text);
  alert.setAttribute("id", "alertMessage");
  var searchBar = document.getElementsByClassName('header')[0];
  searchBar.appendChild(alert);
},300);*/
})();


