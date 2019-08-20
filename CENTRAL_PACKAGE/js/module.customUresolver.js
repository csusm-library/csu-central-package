angular.module('customUresolver', []);

angular.module('customUresolver').component('csuCustomUresolver', {
	bindings: {
		parentCtrl: '<'
	},
	templateUrl: 'custom/CENTRAL_PACKAGE/html/module.customUresolver.html',
	controller: ['$scope', '$rootScope', '$sce', 'customUresolverService', 'customUresolver', 'customUresolverDefault', function ($scope, $rootScope, $sce, customUresolverService, customUresolver, customUresolverDefault) {
		var _this = this;

		_this.vid = _this.parentCtrl.configurationUtil.vid;
		_this.itemCtrl = $scope.$parent.$parent.$parent.$parent.$ctrl;
		_this.item = _this.itemCtrl.item;
		_this.pnx = _this.item.pnx;
		_this.link = _this.parentCtrl.linksArray[0].link;
		_this.linkPrefix = _this.parentCtrl.linksArray[0].link.match(new RegExp("(?:\:\/\/)(.*?)(?:\\.)"))[1];
		_this.loginService = $rootScope.$$childHead.$$childHead.$$nextSibling.$ctrl.loginIframeService.loginService;
		$scope.isLinktoOnline = false;
		$scope.isLinkToResourceSharing = false;
		_this.tempExt = [];
		_this.mms_id = _this.pnx.display.hasOwnProperty('lds04') ? _this.pnx.display.lds04[0] : null;
		_this.logToConsole = false;
		_this.userSessionManagerService = _this.itemCtrl.userSessionManagerService;
		$scope.userIsLoggedIn = _this.userSessionManagerService.jwtUtilService.getDecodedToken().userName ? true: false;
		if (_this.logToConsole) console.log('userIsLoggedIn:' + $scope.userIsLoggedIn)

		_this.servicesArray = _this.parentCtrl.fullViewService.servicesArray;

		$scope.hasLocal = false;
		$scope.preholdings = _this.item.delivery.holding.filter(function(holding, index) {return holding.organization == _this.vid.substring(0, 10)});
		$scope.extLocations = [];
		$scope.showCompact = customUresolver.hasOwnProperty("showCompact") ? customUresolver.showCompact : customUresolverDefault.showCompact;
		$scope.showRequestInViewIt = customUresolver.hasOwnProperty("showRequestInViewIt") ? customUresolver.showRequestInViewIt : customUresolverDefault.showRequestInViewIt;
		$scope.showExtHoldings = false;
		$scope.showResourceSharing = false;
		$scope.showILL = false;
		$scope.resourceSharingAvailable = false;
		$scope.consortiaHoldings = [];
		$scope.availableConsortiaHoldings = false;
		$scope.hasNonForbiddenLocations = false;
		$scope.availableLocalHoldings = false;
		$scope.hasGetIt = false;
		$scope.requestOptions = {item: false, ill: false, local: false, local_diff: false, purchase: false, resource_sharing: false};
		$scope.requestedOption = false;
		$scope.requestReady = false;
		$scope.requestSent = false;
		$scope.requestDataReceived = false;
		$scope.requestSuccessful = false;
		$scope.requestMessageCleared = false;
		$scope.requestError = false;
		$scope.showRequestForm = false;
		$scope.requestShowOptions = customUresolver.hasOwnProperty("requestShowOptions") ? customUresolver.requestShowOptions : customUresolverDefault.requestShowOptions;
		$scope.requestFormOptions = {
			description: {
				name: 'description',
				show: false,
				required: false,
				value: ''
			},
			volume: {
				name: 'volume',
				show: false,
				required: false,
				value: ''
			},
			notNeededAfter: {
				name: 'notNeededAfter.fullDateStr',
				show: false,
				required: false,
				value: ''
			},
			comment: {
				name: 'comment',
				show: false,
				required: false,
				value: ''
			}
		};

		for (var i = 0; i < _this.servicesArray.length; i++) {
			if ($scope.showRequestInViewIt) $scope.hasGetIt = true;
			if (_this.servicesArray[i].serviceName == 'activate') {
				if (_this.servicesArray[i].linkElement.category == 'Alma-P' || (_this.servicesArray[i].linkElement.category == 'Remote Search Resource' && _this.servicesArray[i].linkElement.title == 'nui.getit.alma_tab1_nofull')) {
					$scope.hasGetIt = true;
				}
			}
		}

		$scope.doShowButton = function () {
			if (_this.itemCtrl.index === 1) {
				if ((!$scope.showResourceSharing && !$scope.showILL && ($scope.requestOptions.local || $scope.requestOptions.local_diff)) || $scope.showResourceSharing || $scope.showILL || !$scope.userIsLoggedIn) {
					if ($scope.userIsLoggedIn) return true;
					return $scope.hasGetIt;
				}
			}
			return false;
		}
		_this.hideRequestMessage = function (item = false) {
			if(item) {
				item.requestDataReceived = false;
				item.requestMessageCleared = true;
				item.requestSent = false;
				item.requestError = false;
			} else {
				$scope.requestDataReceived = false;
				$scope.requestMessageCleared = true;
				$scope.requestSent = false;
				$scope.requestError = false;
			}
		}
		_this.checkKeyCode = function (event) {
			if(event != false) {
				if(event.keyCode == 13 || event.keyCode == 32) return true;
				else return false;
			}
			return null;
		}
		_this.toggleShowItems = function (holding, event = false) {
			if (_this.checkKeyCode(event) === false) return;
			holding.showItems = holding.showItems ? false : true;
			if (event != false) event.preventDefault();
			if (_this.logToConsole) console.log(holding);
		}
		_this.toggleShowCompact = function () {
			$scope.showCompact = $scope.showCompact ? false : true;
			if (_this.logToConsole) console.log($scope.showCompact);
		}
		_this.toggleShowExtHoldings = function () {
			$scope.showExtHoldings = $scope.showExtHoldings ? false : true;
			if (_this.logToConsole) console.log($scope.showExtHoldings);
		}
		_this.getHoldingsCountFromBib = function (bib, vid) {
			let count = 0;
			for (var i = 0; i < bib.length; i++) {
				if (bib[i].institution_code == vid.substring(0, 10)) count++;
			}
			return count;
		}
		_this.getItemsCountFromHoldings = function () {
			let count = 0;
			for(var i in $scope.holdings) {
				count += $scope.holdings[i].total_items;
			}
			return count;
		}
		_this.resetRequestOptions = function () {
			for(var i in $scope.requestFormOptions) {
				$scope.requestFormOptions[i].show = false;
				$scope.requestFormOptions[i].required = false;
				$scope.requestFormOptions[i].value = '';
			}
		}
		_this.closeRequestForm = function () {
			$scope.showRequestForm = false;
			$scope.requestedOption = false;
		}
		_this.handleRequestForm = function (which, item = false) {
			_this.resetRequestOptions();
			var showForm = false;
			$scope.requestedOption = which;
			switch(which) {
				case 'local_diff':
					$scope.requestFormOptions.description.show = true;
					$scope.requestFormOptions.description.required = true;
					for (var i in $scope.holdings) {
						if ($scope.holdings[i].hasOwnProperty('items') && $scope.holdings[i].items.length > 0) {
							_this.requestData.itemId = $scope.holdings[i].items[0].item_id;
							continue;
						}
					}
					showForm = true;
					break;
				case 'local':
					if($scope.requestShowOptions) {
						if(_this.getItemsCountFromHoldings() > 1) {
							$scope.requestFormOptions.volume.show = true;
							showForm = true;
						}
					}
					break;
				case 'ill':
					if($scope.requestShowOptions) {
						if($scope.consortiaHoldings.length > 0) {
							$scope.requestFormOptions.volume.show = true;
							showForm = true;
						}
					}
					break;
				case 'item':
					_this.requestData.itemId = item.item_id;
					_this.requestData.description = item.description;
					break;
				default:
					_this.closeRequestForm();
					break;
			}

			if(showForm) $scope.showRequestForm = true;
			else _this.sendRequest(item);
		}
		_this.validate = function() {
			if($scope.showRequestForm) {
				for(var i in $scope.requestFormOptions) {
					if($scope.requestFormOptions[i].required)
						if($scope.requestFormOptions[i].value == '')
							return false;
				}
			}
			return true;
		}
		_this.sendRequest = function (item = false) {
			if (_this.validate()) {
				if ($scope.requestReady) {
					if(!item) $scope.requestSent = true;
					else item.requestSent = true;
					if($scope.showRequestForm) {
						for(var i in $scope.requestFormOptions) {
							if($scope.requestFormOptions[i].show) _this.requestData[$scope.requestFormOptions[i].name] = $scope.requestFormOptions[i].value;
						}
					}
					if(!item) $scope.requestMessageCleared = false;
					else item.requestMessageCleared = false;
					if ($scope.requestedOption == 'ill') _this.requestData.requestType = 'ill';
					else _this.requestData.requestType = 'available';
					_this.closeRequestForm();
					customUresolverService.getRequest(_this.linkPrefix, JSON.stringify(_this.requestData)).then(
						data => {
							if(!item) $scope.requestDataReceived = true;
							else item.requestDataReceived = true;
							if (data.request_successful === true) {
								if(!item) $scope.requestSuccessful = true;
								else item.requestSuccessful = true;
								if (_this.logToConsole) console.log('This should really be displayed to the patron and then hide the request button');
							} else {
								if(!item) $scope.requestSuccessful = false;
								else item.requestSuccessful = false;
								if(typeof data.error_message !== 'undefined' && data.error_message != '') {
									if(!item) $scope.requestError = data.error_message;
									else item.requestError = data.error_message;
								}
								if (_this.logToConsole) console.log('Same as before, display a message to the user and then hide the request button or something');
							}
							if (_this.logToConsole) console.log(data);
						}
					)
					_this.requestData.requestType = '';
				}
			}
		}
		_this.getOpenURLData = function() {
			var openURLData = '';
			for (var item in _this.pnx.addata) {
				if (_this.pnx.addata[item][0] != 'undefined'){
					openURLData += '&rft.' + item + '=' + _this.pnx.addata[item][0];
				}
			}
			return openURLData;
		}
		_this.openILL = function () {
			window.open((customUresolver.hasOwnProperty("illURL") ? customUresolver.illURL : customUresolverDefault.illURL) + '?Action=10&Form=30' + _this.getOpenURLData(), '_newTab');
		}
		_this.hasLocateURL = function() {
			return customUresolver.hasOwnProperty("locateURL") ? true : false;
		}
		_this.getLocateURL = function(holding) {
			var locateUrl = customUresolver.hasOwnProperty("locateURL") ? customUresolver.locateURL : customUresolverDefault.locateURL;
			locateUrl = locateUrl.replace(new RegExp('{library_code}', 'g'), encodeURIComponent(holding.library_code));
			locateUrl = locateUrl.replace(new RegExp('{location_code}', 'g'), encodeURIComponent(holding.location_code));
			locateUrl = locateUrl.replace(new RegExp('{location_name}', 'g'), encodeURIComponent(holding.location));
			locateUrl = locateUrl.replace(new RegExp('{call_number}', 'g'), encodeURIComponent(holding.call_number));
			locateUrl = locateUrl.replace(new RegExp('{title}', 'g'), encodeURIComponent(_this.pnx.display.title[0]));
			return locateUrl;
		}
		_this.openLocate = function (holding, event = false) {
			if (_this.checkKeyCode(event) === false) return;
			window.open(_this.getLocateURL(holding), '_newTab');
		}

		// determine if links is to resource sharing or online

		if (_this.parentCtrl.linksArray[0].getItTabText == "alma_tab1_unavail" ||
			_this.parentCtrl.linksArray[0].getItTabText == "alma_tab1_restrict") {
				$scope.isLinkToResourceSharing = true;
		} else if (_this.parentCtrl.linksArray[0].isLinktoOnline == true || _this.parentCtrl.linksArray[0].getItTabText == 'Almaviewit' || _this.parentCtrl.linksArray[0].getItTabText == 'Almaviewit_remote') {
			$scope.isLinktoOnline = true;
		}

		_this.requestData = {};

		if (_this.pnx.display.hasOwnProperty('title')) _this.requestData.bookTitle = _this.pnx.display.title[0];
		if (_this.pnx.addata.hasOwnProperty('au')) _this.requestData.authors = _this.pnx.addata.au[0];
		if (_this.pnx.display.hasOwnProperty('edition')) _this.requestData.edition = _this.pnx.display.edition[0];
		if (_this.pnx.addata.hasOwnProperty('isbn')) _this.requestData.isbn = _this.pnx.addata.isbn[0];
		if (_this.pnx.addata.hasOwnProperty('lccn')) _this.requestData.lccNumber = _this.pnx.addata.lccn[0];
		if (_this.pnx.addata.hasOwnProperty('oclcid')) _this.requestData.oclcNumber = _this.pnx.addata.oclcid[0];
		if (_this.pnx.addata.hasOwnProperty('pub')) _this.requestData.publisher = _this.pnx.addata.pub[0];
		if (_this.pnx.display.hasOwnProperty('creationdate')) _this.requestData.year = _this.pnx.display.creationdate[0];
		if (_this.pnx.addata.hasOwnProperty('date') && !_this.requestData.hasOwnProperty('year')) _this.requestData.year = _this.pnx.addata.date[0];
		if (_this.pnx.addata.hasOwnProperty('cop')) _this.requestData.placeOfPublication = _this.pnx.addata.cop[0];
		if (_this.pnx.addata.hasOwnProperty('addau')) _this.requestData.additionalAuthor = _this.pnx.addata.addau[0];
		if (_this.pnx.addata.hasOwnProperty('volume')) _this.requestData.volume = _this.pnx.addata.volume[0];
		if (_this.pnx.addata.hasOwnProperty('part')) _this.requestData.part = _this.pnx.addata.part[0];
		if (_this.pnx.control.hasOwnProperty('sourceid')) _this.requestData.source = 'info:sid/primo.exlibrisgroup.com-' + _this.pnx.control.sourceid[0];
		if (_this.pnx.addata.hasOwnProperty('pages')) _this.requestData.pages = _this.pnx.addata.pages[0];
		if (!_this.requestData.hasOwnProperty('pages')) {
			if (_this.pnx.addata.hasOwnProperty('spage')) _this.requestData.pages = _this.pnx.addata.spage[0];
			if (_this.pnx.addata.hasOwnProperty('epage')) _this.requestData.pages = (_this.requestData.hasOwnProperty('pages') ? (_this.requestData.pages + '-') : '') + _this.pnx.addata.epage[0];
		}
		if (_this.pnx.addata.hasOwnProperty('atitle')) _this.requestData.articleTitle = _this.pnx.addata.atitle[0];
		if (_this.pnx.addata.hasOwnProperty('jtitle')) _this.requestData.journalTitle = _this.pnx.addata.jtitle[0];
		if (_this.pnx.addata.hasOwnProperty('issue')) _this.requestData.journalIssue = _this.pnx.addata.issue[0];
		if (_this.pnx.addata.hasOwnProperty('issn')) _this.requestData.issn = _this.pnx.addata.issn[0];
		if (_this.pnx.addata.hasOwnProperty('doi')) _this.requestData.doi = _this.pnx.addata.doi[0];
		if (_this.pnx.addata.hasOwnProperty('pmid')) _this.requestData.pmid = _this.pnx.addata.pmid[0];
		if (_this.pnx.addata.hasOwnProperty('genre') && _this.pnx.addata.genre[0] != 'article') {
			_this.requestData.format = 'PHYSICAL';
			_this.requestData.citationType = 'BK';
		} else {
			_this.requestData.format = 'DIGITAL';
			_this.requestData.citationType = 'CR';
		}
		_this.requestData.institutionCode = _this.vid.substring(0, 10);
		_this.requestData.pickupInstitutionCode = _this.vid.substring(0, 10);

		/**
		 * Get detailed holdings information from the API
		 * Includes detailed info for local holdings only
		 */
		customUresolverService.getRequestData(_this.link).then(
			data => {
				_this.requestData.mmsId = data.mms_id;
				_this.requestData.userId = data.user_id;
				_this.requestData.physicalServicesResultId = data.physical_services_result_id;
				_this.requestData.holdingKey = data.holding_key;
				_this.requestData.itemId = data.item_id;
				$scope.requestReady = true;
				$scope.requestOptions = data.request_options;
				customUresolverService.getRequestable(_this.vid, _this.linkPrefix, _this.requestData).then(
					available => {
						$scope.resourceSharingAvailable = available.is_requestable;
						if (_this.logToConsole) console.log(available);
					}
				)
				if (_this.logToConsole) console.log(_this.requestData);
			}
		)

		customUresolverService.getNzBib(_this.vid, _this.mms_id, _this.link).then(
			bib => {
				$scope.holdings = [{}];
				$scope.holdingsCount = _this.getHoldingsCountFromBib(bib, _this.vid);
				bib.map(
					holding => {
						if (_this.vid.substring(0, 10) == holding.institution_code) {
							customUresolverService.getHoldingNote(_this.vid, holding.mms_id, holding.holding_id).then(
								holdingnote => {
									if (holdingnote.trim() != '') holding.ava_note = holdingnote
									if (_this.logToConsole) console.log(holdingnote)
								}
							)
							customUresolverService.getStatus(_this.vid, holding.mms_id, holding.holding_id).then(
								items => {
									if (_this.logToConsole) console.log(items)
									holding.items = items
									if (!holding.hasOwnProperty('showItems')) holding.showItems = false
									if ($scope.holdings.length > 0) {
										for (var i = 0; i < $scope.holdings.length; i++) {
											if (typeof $scope.holdings[i]['isTempHolding'] !== 'undefined') {
												if ($scope.holdings[i].mms_id == holding.mms_id) {
													let foundHolding = items.filter(function(item) {return (_this.location_code == item.temp_location) && item.in_temp_location}, $scope.holdings[i]);
													if (foundHolding.length > 0) $scope.holdings[i].items = foundHolding;
												}
											}
										}
									}
									$scope.holdingsCount--;
								}
							)
							$scope.hasLocal = true;
							$scope.holdings.push(holding)
							if (holding.holding_id == '') {
								holding.isTempHolding = true;
							}
							holding.call_number = holding.call_number.replace(/^\(|\)$/g, '');
							if (_this.logToConsole) console.log(holding)
						}
					}
				)
				if (_this.logToConsole) console.log(bib)
			}
		)

		/**
		 * Get basic holdings information from the pnx
		 * Includes basic info for local holdings and external holdings
		 */
		for (var i = 0; i < _this.item.delivery.holding.length; i++) {
			if (_this.item.delivery.holding[i].organization == _this.vid.substring(0, 10)) {
				let mms_id = _this.pnx.display.lds04;
				$scope.hasLocal = true;

				if (_this.item.delivery.holding[i].availabilityStatus.replace(/^\(|\)$/g, '') == 'available') $scope.availableLocalHoldings = true;
			} else {
				let mms_id = _this.pnx.display.lds03.find(function(item) {return item.search(_this.item.delivery.holding[i].organization) >= 0 ? true : false}, _this);

				if (typeof _this.tempExt['length'] == 'undefined') {
					_this.tempExt['length'] = 0
				}

				if (typeof _this.tempExt[_this.item.delivery.holding[i].organization] == 'undefined') {
					_this.tempExt[_this.item.delivery.holding[i].organization] = {
						organization: _this.item.delivery.holding[i].organization,
						locations: []
					}
				}

				if (_this.item.delivery.holding[i].availabilityStatus.replace(/^\(|\)$/g, '') == 'available') $scope.availableConsortiaHoldings = true;

				_this.tempExt[_this.item.delivery.holding[i].organization].locations.push({
					mainLocation: _this.item.delivery.holding[i].mainLocation,
					subLocationCode: _this.item.delivery.holding[i].subLocationCode,
					subLocation: _this.item.delivery.holding[i].subLocation,
					callNumber: _this.item.delivery.holding[i].callNumber.replace(/^\(|\)$/g, ''),
					availabilityStatus: _this.item.delivery.holding[i].availabilityStatus.replace(/^\(|\)$/g, ''),
					mms_id: (typeof mms_id !== 'undefined') ? mms_id.split('$$', 1)[0] : ''
				});
			}
		}

		// other campus holdings

		for (var extLib in _this.tempExt){
			$scope.extLocations.push(_this.tempExt[extLib]);
		}

		_this.campus_names = {
			'01CALS_UBA': 'Bakersfield',
			'01CALS_UCI': 'Channel Islands',
			'01CALS_CHI': 'Chico',
			'01CALS_UDH': 'Dominguez Hills',
			'01CALS_UHL': 'East Bay',
			'01CALS_UFR': 'Fresno',
			'01CALS_FUL': 'Fullerton',
			'01CALS_HUL': 'Humboldt',
			'01CALS_ULB': 'Long Beach',
			'01CALS_ULA': 'Los Angeles',
			'01CALS_MAL': 'Maritime',
			'01CALS_UMB': 'Monterey Bay',
			'01CALS_MLM': 'Moss Landing',
			'01CALS_UNO': 'Northridge',
			'01CALS_PUP': 'Pomona',
			'01CALS_USL': 'Sacramento',
			'01CALS_USB': 'San Bernardino',
			'01CALS_SDL': 'San Diego',
			'01CALS_SFR': 'San Francisco',
			'01CALS_SJO': 'San Jose',
			'01CALS_PSU': 'San Luis Obispo',
			'01CALS_USM': 'San Marcos',
			'01CALS_SOL': 'Sonoma',
			'01CALS_UST': 'Stanislaus'
		};

		// break out each holding and add campus name,
		// so we can have a flatter list for the table

		for (var i = 0; i < $scope.extLocations.length; i++) {
			for (var j = 0; j < $scope.extLocations[i].locations.length; j++) {
				if (customUresolverDefault.rsForbiddenLocations.hasOwnProperty($scope.extLocations[i].organization)) {
					if (customUresolverDefault.rsForbiddenLocations[$scope.extLocations[i].organization].hasOwnProperty($scope.extLocations[i].locations[j].mainLocation)) {
						if (customUresolverDefault.rsForbiddenLocations[$scope.extLocations[i].organization][$scope.extLocations[i].locations[j].mainLocation].indexOf($scope.extLocations[i].locations[j].subLocationCode) === -1 && customUresolverDefault.rsForbiddenLocations[$scope.extLocations[i].organization][$scope.extLocations[i].locations[j].mainLocation].indexOf('*') === -1) {
							$scope.hasNonForbiddenLocations = true;
						} else {
							$scope.extLocations[i].locations[j].localOnly = true;
						}
					} else $scope.hasNonForbiddenLocations = true;
				} else $scope.hasNonForbiddenLocations = true;
				$scope.extLocations[i].locations[j].campus = _this.campus_names[$scope.extLocations[i].organization];
				$scope.consortiaHoldings.push($scope.extLocations[i].locations[j]);
			}
		}

		// sorted by readable campus name

		$scope.consortiaHoldings.sort(function(a, b) {
			if (a.campus < b.campus)
				return -1;
			if (a.campus > b.campus)
				return 1;
			return 0;
		});

		_this.tempExt = null;


		// resource sharing
		// there are other holdings and not locally available

		if ($scope.consortiaHoldings.length > 0 && $scope.availableConsortiaHoldings && $scope.hasNonForbiddenLocations && (
			_this.item.delivery.availability[0] != "available_in_my_institution" &&
			_this.item.delivery.availability[0] != "available_in_maininstitution" &&
			_this.item.delivery.availability[0] != "available_in_institution" &&
			_this.item.delivery.availability[0] != "not_restricted")) {
			$scope.showResourceSharing = true;
		} else {
			if (!$scope.availableLocalHoldings && $scope.hasGetIt) $scope.showILL = true;
		}

		// logged into primo, but uresolver is logged out
		// need to log out and log back in

		if (typeof _this.requestData.physicalServicesResultId !== 'undefined' && $scope.userIsLoggedIn) {
			if (_this.logToConsole) console.log('uresolver is not logged in, not going to get any data');
		}

		if (_this.logToConsole) console.log('links array:');
 		if (_this.logToConsole) console.log(_this.parentCtrl.linksArray);
		if (_this.logToConsole) console.log('link: ' + _this.link);
		if (_this.logToConsole) console.log('isLinkToOnline: ' + $scope.isLinktoOnline);
		if (_this.logToConsole) console.log('isLinkToResourceSharing: ' + $scope.isLinkToResourceSharing);
		if (_this.logToConsole) console.log('availability: ' + _this.item.delivery.availability[0]);
		if (_this.logToConsole) console.log('showResourceSharing: ' + $scope.showResourceSharing);
	}]
})
.factory('customUresolverService', ['$http', 'customUresolver', 'customUresolverDefault', function ($http, customUresolver, customUresolverDefault) {
	return {
		getRequestable: function (vid, linkPrefix, data) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'checkavailable', 'vid': vid, 'id': linkPrefix, 'id2': data },
				cache: true
			}).then(response => response.data)
		},
		getRequestData: function (link) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'requestdata', 'id': link },
				cache: true
			}).then(response => response.data)
		},
		getRequest: function (linkPrefix, data) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'sendrequest', 'id': linkPrefix, 'id2': data },
				cache: true
			}).then(response => response.data)
		},
		getNzBib: function (vid, mms_id, link) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'nzbib', 'vid': vid, 'id': mms_id, 'id2': link },
				cache: true
			}).then(response => response.data)
		},
		getBib: function (vid, mms_id) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'bib', 'vid': vid, 'id': mms_id },
				cache: true
			}).then(response => response.data)
		},
		getHoldingNote: function (vid, mms_id, holdingid) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'holdingnote', 'vid': vid, 'id': mms_id, 'id2': holdingid },
				cache: true
			}).then(response => response.data)
		},
		getStatus: function (vid, mms_id, holdingid) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'status', 'vid': vid, 'id': mms_id, 'id2': holdingid },
				cache: true
			}).then(response => response.data)
		},
		getUresolver: function (url) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'uresolver', 'id': encodeURIComponent(url) },
				cache: true
			}).then(response => response.data)
		}
	}
}])
.run(['$http', '$templateCache', 'customUresolver', 'customUresolverDefault', function ($http, $templateCache, customUresolver, customUresolverDefault) {
	if (customUresolver.hasOwnProperty("enabled") ? customUresolver.enabled : customUresolverDefault.enabled) {
		$http.defaults.headers.common = {"X-From-ExL-API-Gateway": undefined}
		$templateCache.put('components/search/fullView/getit/almaMashup/almaMashup.html', '<csu-custom-uresolver parent-ctrl="$ctrl"></csu-custom-uresolver>'); //replaces the alma mashup template with the custom uresolver template
		$templateCache.put('components/search/fullView/getit/almaMoreInst/alma-more-inst.html', ''); // no longer needed, provided by the custom template
		$templateCache.put('components/search/fullView/fullViewServiceContainer/login-alma-mashup.html', ''); // no longer needed, provided by the custom template
	}
}])
.value('customUresolver', {}).value('customUresolverDefault', {
	enabled: false,
	showCompact: false,
	showRequestInViewIt: false,
	requestShowOptions: false,
	bibURL: 'https://library.calstate.edu/primo-resolver/?',
	illURL: 'https://proxy.library.cpp.edu/login?url=https://illiad.library.cpp.edu/illiad/illiad.dll',
	locateURL: '', //ex: http://www.library.edu/maps/?library_code={library_code}&location_code={location_code}&location_name={location_name}&call_number={call_number}&title={title}'
	rsForbiddenLocations: {
		'01CALS_UBA': {
			'CSUB': ['ACQ', 'ARCHIVES', 'ARCHIVEDOC', 'ARCHIVEAST', 'ATLAS', 'ATLASDOC', 'AVMAIN', 'AVREF', 'AVRESERVE', 'BIND', 'CATALOGING', 'CIRCDESK', 'CD REVIEW', 'CURRICULUM', 'DAMAGED', 'EQUIPMENT', 'GOVDOCREV', 'INDEX', 'INDEX2', 'INDEXDOC', 'INDEXDOC2', 'LAW', 'LAWDOC', 'MEND', 'MFLACHC', 'MIGRATERR', 'MUSIC', 'ODYSSEY', 'PERBD', 'PERBDDOC', 'PERCHECKIN', 'PERIODDOC', 'PERIODICAL', 'PERSW', 'PERSWDOC', 'PROCESSING', 'REFDESK', 'REFDESKDOC', 'REFDOC', 'REFERENCE', 'RESERVES', 'RESVDESK', 'REVIEW', 'RNRTXT', 'SPCOL4FLR', 'SPCOLDOC', 'SPC1AUTOGR', 'SPC2DODSON', 'SPC3WARREN', 'SPC4FACCOL', 'SPC5KCCOLL', 'SPC6RAREBK', 'SPC7THESES', 'SPC8CARARE', 'SPC9DONAHO', 'STUDYROOM3', 'STUDYROOM4', 'TECHSERV', 'WITHDRAWN']
		},
		'01CALS_UCI ': {
			'JSBLIBRARY': ['ARCHIVES', 'CIRCDESK', 'CSULONG', 'CSUSHORT', 'POPULAR', 'REFERENCE', 'RESERVE', 'SPECIAL', 'SRIRSC', 'WMC'],
			'MEDIADISTR': ['EQUIPMENT']
		},
		'01CALS_CHI': {
			'CSUChico': ['Reserve24', 'Reserve2hr', 'ReserveLUO', 'CurrKit', 'Equipment', 'EquipRes', 'Error', 'GovFiche', 'GovFilm', 'inactive', 'Indexes', 'InstOffice', 'Kindles', 'Laptops', 'LaptopsEmp', 'LaptopsStd', 'Maps', 'Microcards', 'Microfiche', 'Microfilm', 'NewsMF', 'Newspapers', 'Per', 'PerMF', 'ReservePer', 'PerPop', 'PopularMed', 'PerPop2', 'UNASSIGNED', 'PROBLEMPER', 'Reference', 'RefAtlas', 'RefReady', 'ReserveFac', 'ReserveLib', 'Reserves', 'ReserveSLF', 'CSULONG', 'CSUSHORT', 'SPCMaps', 'SPCMapsX', 'SPCMapsXX', 'NECal', 'NECalDoc', 'NECalMSS', 'NECalMSSXB', 'NECalMSSXF', 'NECalMedia', 'NECalMF', 'NECalX', 'RareBooks', 'RareBooksX', 'RefSPC', 'UA', 'UAMSS', 'UAMSSX', 'UAMedia', 'UAX']
		},
		'01CALS_UDH': {
			'CSUDH-RBR': ['2daycrf', '2daycr', '2hourcrf', '2hourcr', '2hournof', '2hourno', 'ttl2nol', 'ttl2nor', '4dycr', '4daycrf', '4daycr', '4hourmcrf', '4hourmcr '],
			'CSUDH-TCP': ['tcp_ipad', 'tcp_laptop'],
			'CSUDH': ['archv/spco', 'spcol_strg', 'micro', 'periodical', 'per_strg', 'ref', 'ref_desk', 'borrowill', 'lendill', 'thesis']
		},
		'01CALS_UHL': {
			'CSUEB-CCL': ['lapcc', 'cccre', 'cccrs', 'jffcc'],
			'CSUEB-CIRC': ['adm', 'arc', 'cat', 'diy', 'jff', 'micre', 'mrlp', 'mrrec', 'mrvid', 'micf', 'mif', 'mic', 'mnew', 'nbs', 'pern', 'perf', 'per', 'refdk', 'ref', 'mrres', 'sc', 'scart', 'scbbr', 'scbbf', 'scbff', 'scbp', 'scbpf', 'scbay', 'scbaf', 'scbr', 'scbrf', 'scei', 'sceif', 'scf', 'scff', 'scfff', 'scmp', 'scmpf', 'scm', 'scp', 'scpf', 'ts'],
			'CSUEB-LC': ['LC']
		},
		'01CALS_UFR': {
			'EMPTY': ['UNASSIGNED'],
			'CSUFRESNO1': ['a', 'aae', 'aat', 'aga', 'arf', 'bg', 'bl', 'cb', 'cca', 'cmb', 'cnb', 'del', 'eq28d', 'eq3d', 'eq7d', 'eqsem', 'ex', 'f', 'frf', 'fth', 'grf', 'ill', 'm', 'mbg', 'meq1', 'meq3', 'meq4', 'mflp', 'mlt', 'mltm', 'mltsb', 'n', 'nam', 'nbr', 'nca', 'ncr', 'nnb', 'npe', 'p', 'pc', 'rb', 'rbd', 'rbt', 'rf', 'rfde', 'rfht', 'uau', 'ub', 'ueq1d', 'UFRBOR', 'UFRLEND', 'UFRSHORT', 'UNASSIGNED', 'urb', 'urf', 'urt', 'v', 'vr', 'wdn', 'x', 'xa', 'xc', 'xcv', 'xcvr', 'xe', 'xf', 'xja', 'xk', 'xl', 'xm', 'xms', 'xrf', 'xs', 'xt', 'xw', 'xwav', 'xwm', 'xwr']
		},
		'01CALS_FUL': {
			'IRVINE': ['crctest', 'etc', 'IRVC Books', 'IRVC Disp', 'etcrf', 'etcp', 'IRVC Ref', 'IRVC Reser', 'IRVC Lap', 'IRVC Suppl', 'UNASSIGNED'],
			'CSUF': ['circ', 'ciravHigh', 'crc', 'CirSupply', 'cirav', 'cirtc', 'clrc', 'ClrcNew'],
			'SpeCol': ['fcp', 'fc', 'sc', 'sca', 'scpa', 'scam', 'SCRA', 'scbh', 'scph', 'sck', 'scpk', 'schc', 'scpc', 'scd', 'us', 'scp', 'scsh', 'scs', 'schb', 'scpb', 'scl', 'scpl', 'sclh', 'sclhp', 'scm', 'scpm', 'sco', 'scpy', 'scwfp', 'scr', 'scpr', 'scref', 'scsf', 'scpe', 'scwa', 'ua', 'UNASSIGNED']
		},
		'01CALS_HUL': {
			'HSULIB': ['ArchStrg', 'CalDoc-luo', 'CAT', 'CIRC', 'CSULONG', 'CSUSHORT', 'GISLab', 'HumCo', 'HumCo-Rare', 'Microforms', 'Newspapers', 'Periodical', 'PermRes', 'PerStrg', 'Ref', 'Res', 'SpecCollEx', 'Staff', 'USDocs-abs', 'USDocs-luo']
		},
		'01CALS_ULB': {
			'CSULB': ['2stacks-nc', '3stacks-nc', '4stacks-nc', 'archivcs', 'archives', 'borrowill', 'borrowlink', 'caldocs-nc', 'chin-ency', 'circ-equip', 'csulb', 'CSULONG', 'CSUSHORT', 'docfiche', 'dumond', 'feddocs-nc', 'graham', 'huntington', 'index-abst', 'jeffers', 'jrare', 'juv', 'lendill', 'lendlink', 'main', 'mapatlas', 'mapflat', 'mapov', 'mapvert', 'masback', 'medialink', 'microcard', 'microfiche', 'microfilm', 'newspapers', 'orcacsu', 'orca-nc', 'periodical', 'photo', 'rare', 'refatlas', 'refdesk', 'reference', 'refov', 'rescirc1d', 'rescirc1h', 'rescirc3d', 'rescirc3h', 'rescirc7d', 'resfac1d', 'resfac1h', 'resfac3d', 'resfac3h', 'resfac7d', 'resref1d', 'resref1h', 'resref3d', 'resref3h', 'resref7d', 'scdisplay', 'spec-coll', 'speccollof', 'speccollov', 'speccs', 'specref', 'storage-nc', 'suppress', 'thesoffice']
		},
		'01CALS_ULA': {
			'CSULA': ['ref', 'ref1', 'refat', 'refr', 'resv', 'reserveDVD', 'equipment']
		},
		'01CALS_MAL': {
			'Maritime': ['csumb', 'csumh', 'csumz', 'csume', 'csumk', 'csumm', 'csuml', 'csums', 'csumx', 'csumc', 'csumw']
		},
		'01CALS_UMB': {
			'CSUMBLIB': ['AcqSerial', 'Archives', 'Atlas', 'BindMend', 'bkstklimit', 'Cataloging', 'CircDesk', 'Reserve', 'EBooks', 'GovtPubs', 'LibMedia', 'Map Case', 'Microforms', 'Oversize', 'PerStacks', 'ProtColl', 'recreading', 'Reference', 'RefDesk', 'RefDisplay', 'CSULONG', 'CSUSHORT', 'SELF', 'SpecColl', 'SpecRes1', 'SpecRes2', 'SpecRes3', 'StreamVid', 'UNASSIGNED', 'zzz']
		},
		'01CALS_MLM': {
			'MLML': ['atlas', 'compjournl', 'comprare', 'DISPLAY-C', 'DISPLAY-NC', 'expedition', 'fishgame', 'flatmaps', 'itech', 'mainjournl', 'maps', 'Oversize', 'rare', 'ref', 'reserve', 'workroom']
		},
		'01CALS_UNO': {
			'CMS': ['*'],
			'LCT': ['*'],
			'Map': ['*'],
			'MM': ['mmc', 'mmd', 'mmi', 'mmr', 'musfr', 'musfn', 'musno'],
			'Oviatt': ['asncn', 'asnco', 'asrsn', 'asrsp', 'asrsmun', 'asrsvid', 'cirgs', 'lcd', 'ncodn', 'per', 'ref', 'refdk', 'refoz', 'tccasrs', 'tsbnd', 'xstacks'],
			'RPM': ['asmi', 'asrsp', 'micrc', 'micrd', 'micro', 'micrf', 'micrb', 'prr', 'rbrdk', 'rbrdf', 'rbr', 'rbrf', 'RPMprr'],
			'SCA': ['*'],
			'TCC': ['tccbb', 'tccjv', 'tcckt', 'tccmd', 'tccpc', 'tccno', 'tccpi', 'tccrv']
		},
		'01CALS_PUP': {
			'MAIN': ['audio', 'broz3', 'cass', 'cd', 'cdr/d', 'cdrom', 'comic', 'CSULONG', 'CSUSHORT', 'dbr', 'digit', 'disp3', 'dispa', 'displ', 'doc3', 'doc4', 'doc6', 'dvd', 'dvd/d', 'eaudi', 'ebook', 'ediss', 'ejour', 'eproj', 'eres', 'ethes', 'evide', 'exhib', 'facul', 'graph', 'InactivePR', 'inter', 'lap', 'map', 'media', 'mficg', 'mfich', 'mfilg', 'mfilm', 'new', 'newcd', 'newdv', 'news', 'per', 'per24', 'per48', 'PermRes', 'Pomona_FU', 'r24h', 'rbr', 'rbr14', 'rbr28', 'rbr3', 'rbr48', 'rbr7', 'rbrn', 'rbrq', 'rbrs', 'ref', 'slide', 'UNASSIGNED', 'vid/d', 'video', 'zacq', 'zbib', 'zill', 'zlo', 'zord', 'zpro', 'ztoss'],
			'SPEC': ['*']
		},
		'01CALS_USL': {
			'irt': ['*'],
			'sacstate': ['1nm', 'rbrlc', 'lapto', '2rd', 'bin', 'exh', 'spec', 'tsaks'],
			'union': ['*']
		},
		'01CALS_USB': {
			'LMMC': ['m_dvd2hr', 'm_vhs2hr', 'mcircd'],
			'PDC': ['pdccircd', 'pdcref', 'pdcreserve', 'pdcssarch'],
			'PFAU': ['bkclub', 'c_dvd2hr', 'circd', 'curfm', 'ebook', 'ejrnl_gov', 'er_gov', 'journl', 'journlfeat', 'main5ref', 'mapref', 'mfiche', 'mfiche_gov', 'mfilm_mono', 'mfilm_per', 'newspaper', 'obsolete', 'on_order', 'ref', 'refatlas', 'refdk', 'reserves24', 'reserves2h', 'reserves2n', 'reserves3n', 'reserves7d', 'restr', 'restr_ref', 'sp_archive', 'sp_calelec', 'sp_childli', 'sp_comic', 'sp_gen', 'sp_lln', 'sp_mideast', 'sp_natamer', 'sp_postcar', 'sp_pulpfic', 'sp_rare', 'sp_reghis', 'sp_vdc', 'sp_westam', 'sp_ww2', 'stor_per', 'stor_ref', 'thesis_ref', 'techservic', 'wri', 'wri_ref', 'wri_wrca']
		},
		'01CALS_SDL': {
			'24/7': ['*'],
			'CCC': ['*'],
			'IVC': ['*'],
			'PRIDE': ['*'],
			'Main': ['1-day res', '28-day res', '1inactive', '2-hour res', '3-day res', '4-hour NO', '4-hour res', '7-day res', 'asp', 'cds', 'cdt3', 'cdt4', 'cdt5', 'chr', 'circ-equip', 'CIRCUIT', 'CSULONG', 'CSUSHORT', 'digim', 'digip', 'gcb', 'gcr', 'gmc', 'gmu', 'gut', 'gvr', 'map', 'mnc', 'mncc', 'mncd', 'mncf', 'mncp', 'mpi', 'mrf', 'nsp', 'pln', 'pru', 'ps5', 'rdc', 'ref', 'refnc', 'Repair', 'rfa', 'rfd', 'rfl', 'rfo', 'scg', 'UNASSIGNED', 'vfr', 'wsr'],
			'COMPUTING': ['*'],
			'SPEC COL': ['*']
		},
		'01CALS_SFR': {
			'DMSMAKE': ['*'],
			'MAIN': ['camoff', 'catboff', 'dictionary', 'distoff', 'dscoff', 'gpmic', 'ilsoff', 'maindist', 'microform', 'refatlas', 'lrsbound', 'lrsdebmn', 'lrsgov', 'lrslp', 'lrs', 'lrsmedia', 'lrsref', 'lrsth', 'lrsyp'],
			'STORAGE': ['*'],
			'RCOMMONS': ['*'],
			'SPECIALCOL': ['*'],
			'SCOMMONS': ['*']
		},
		'01CALS_SJO': {
			'SJSU': ['4flr_ADM', 'a1b', 'a1c', 'a1i', 'a2', 'a2f', 'a2o', 'a2v', 'a4', 'a6l', 'a6v', 'a7', 'a70', 'a71', 'a8', 'acr', 'aex', 'agf', 'agr', 'aho', 'ai', 'al', 'amc', 'amf', 'amm', 'amr', 'ap', 'apb', 'ar', 'arc', 'ard', 'ardf', 'ardo', 'arf', 'ari', 'arm', 'aro', 'as', 'as2', 'as3', 'asf', 'aso', 'asp', 'asr', 'asrf', 'ass', 'ass2', 'assf', 'asso', 'assp', 'asst', 'asstf', 'assto', 'av', 'ave', 'avf', 'avp', 'aw', 'ax', 'CSUSHORT', 'DAMAGES', 'gradkey', 'ILLBOR', 'ILLLEND', 'MISSING', 'mtj_test', 'SJSUBOR', 'SJSULEND', 'TECHSRV_PR', 'UNASSIGNED', 'USPREF'],
			'SCS': ['*']
		},
		'01CALS_PSU': {
			'CPSLO_POCO': ['*'],
			'CPSLO_MAIN': ['goodreads', 'newbooks', 'gradkeys', 'trcspanish', '1dayres', '1hourres', '24hrequip', '2dayres', '2hourres', '2hrovntres', '3dayequip', '3hrequip', '4hourres', 'Inactive', 'permres', 'califdoccd', 'currentper', 'curperdisp', 'diablo', 'feddoccd', 'fmaps', 'localdocs', 'localdoccd', 'maps', 'microform', 'newspapers', 'deskcopy', 'research', 'srproj', 'soilsurv'],
			'CPSLO_SCA': ['*']
		},
		'01CALS_USM': {
			'Archive': ['*'],
			'Campus': ['*'],
			'Library': ['ref', 'refrhd', 'CSULONG', 'CSUSHORT', 'gdusa_nc', 'bcwsuppres', 'circeq', 'circdsuppr', 'faccentsu', 'stacq_3', 'libsuppres', 'trc'],
			'Media': ['medres', 'medeq', 'medsuppres']
		},
		'01CALS_SOL': {
			'MAIN': ['circ_disp2', 'circ_disp3', 'circ_new', 'circ_oxf', 'circ_pop', 'med_new', 'cur_journ', 'cur_news', 'mcr_main', 'mcr_ref', 'ref_cit', 'ref_main', 'tech', 'rsv_media', 'rsv_fac', 'rsv_print', 'reg_atlas', 'reg_books', 'reg_maps', 'spec_book', 'spec_fin', 'spec_folio', 'spec_leb', 'spec_lyman', 'spec_mini', 'spec_over', 'spec_reg', 'spec_jones', 'ars_thesis']
		},
		'01CALS_UST': {
			'CSUSTAN': ['i', 'ib', 'id', 'IMStorage', 'ip', 'ir', 'ixs', 's', 'sz', 'tc', 'tmc', 'tpn', 'tr', 'tv', 'tz', 'tzv', 'UNASSIGNED', 'xs', 'xssa', 'xu', 'xut', 'xuti']
		}
	}
});
