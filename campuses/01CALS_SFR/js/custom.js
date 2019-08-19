(function() {
  "use strict";
  'use strict';


  var app = angular.module('viewCustom', ['angularLoad']);

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
    template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://library.sfsu.edu"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
  });

})();
/**
 (function() {
    var x = document.createElement("script"); x.type = "text/javascript"; x.async = true;
    x.src = (document.location.protocol === "https:" ? "https://" : "http://") + "us.libraryh3lp.com/js/libraryh3lp.js?multi,poll,popup";
    var y = document.getElementsByTagName("script")[0]; y.parentNode.insertBefore(x, y);
  })();*/
//Load SpringShare LibChat Script//
(function() {

    var head = document.head;
    var floatingScript = document.createElement('script');
    floatingScript.type = 'text/javascript';
    floatingScript.src = 'https://v2.libanswers.com/load_chat.php?hash=679a47559959e1a7d7caa855a416f1fb';
	head.appendChild(floatingScript);
  })();
//AskUs Widget start
const popupChat = ()=>{
    const floatingChat = document.querySelector('#s-lch-widget-11574 button img');
    const chatLink = document.querySelector('#libchat_c35aa189501f6ec15ef6799bb6c26a66 a')
    const chatImg = document.querySelector('#libchat_c35aa189501f6ec15ef6799bb6c26a66 a img');
	const emailContent = document.querySelector(".email-content");
	const email = document.querySelector(".email");
	const phoneContent = document.querySelector(".phone-content");
	const phone = document.querySelector(".phone");
	//check to make sure element is not null
    if (floatingChat !==null && chatImg !==null && email !== null && phone !==null && chatLink !== null){
		console.log("he");
		//add listenter for email and phone icons
		  email.addEventListener("click", function() {
			emailContent.classList.toggle("change");
			});
		  phone.addEventListener("click", function() {
			phoneContent.classList.toggle("change");
			});
			document.addEventListener('click', function(event) {
				let isClickemail = email.contains(event.target);
				let isClickemailContent = emailContent.contains(event.target);
				let isClickPhone = phone.contains(event.target);
				let isClickPhoneContent = phoneContent.contains(event.target);
				if (!isClickemail && !isClickemailContent) {
					emailContent.classList.remove("change");
					}
				if (!isClickPhone && !isClickPhoneContent){phoneContent.classList.remove("change")};
			});
		if (floatingChat.alt === "Offline"){
		  chatImg.src="https://library.sfsu.edu/sites/default/files/icons%20no-chat-24_0_tranparent.png";
		  chatLink.href ='https://sfsu.libanswers.com';
		  chatLink.setAttribute('target','_blank');
		  chatLink.removeAttribute('onclick');
		  chatLink.title='chat_off';
		  clearInterval(checkPopChat);
		}
		else{
			clearInterval(checkPopChat);
		}
	}
};

const checkPopChat =setInterval(popupChat,300);

//AskUs widget End

  //$('#getit_link1_0').insertBefore('#action_list');
