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
		$scope.localLocations = [];
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
		$scope.requestOptions = {ill: false, local: false, local_diff: false, purchase: false, resource_sharing: false};
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
				if (_this.servicesArray[i].linkElement.category == 'Alma-P') {
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
		_this.hideRequestMessage = function () {
			$scope.requestDataReceived = false;
			$scope.requestMessageCleared = true;
			$scope.requestSent = false;
			$scope.requestError = false;
		}
		_this.toggleShowItems = function (holding, event = false) {
			if (event != false && event.keyCode !== 13 && event.keyCode !== 32) return;
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
		_this.handleRequestForm = function (which) {
			_this.resetRequestOptions();
			var showForm = true;
			$scope.requestedOption = which;
			switch(which) {
				case 'local_diff':
					$scope.requestFormOptions.description.show = true;
					$scope.requestFormOptions.description.required = true;
					break;
				case 'local':
					if($scope.requestShowOptions)
						if(_this.getItemsCountFromHoldings() > 1)
							$scope.requestFormOptions.volume.show = true;
						else
							showForm = false;
					else
						showForm = false;
					break;
				case 'ill':
					if($scope.requestShowOptions)
						if($scope.consortiaHoldings.length > 0)
							$scope.requestFormOptions.volume.show = true;
						else
							showForm = false;
					else
						showForm = false;
					break;
				default:
					showForm = false;
					$scope.requestedOption = false;
					break;
			}
			
			if(showForm) $scope.showRequestForm = true;
			else _this.sendRequest();
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
		_this.sendRequest = function () {
			if (_this.validate()) {
				if ($scope.requestReady) {
					$scope.requestSent = true;
					if($scope.showRequestForm) {
						for(var i in $scope.requestFormOptions) {
							if($scope.requestFormOptions[i].show) _this.requestData[$scope.requestFormOptions[i].name] = $scope.requestFormOptions[i].value;
						}
					}
					$scope.showRequestForm = false;
					$scope.requestMessageCleared = false;
					if ($scope.requestedOption == 'ill') _this.requestData.requestType = 'ill';
					else _this.requestData.requestType = 'available';
					if ($scope.requestedOption == 'local_diff') {
						for (var i in $scope.holdings) {
							if ($scope.holdings[i].hasOwnProperty('items') && $scope.holdings[i].items.length > 0) {
								_this.requestData.itemId = $scope.holdings[i].items[0].item_id;
								continue;
							}
						}
					}
					$scope.requestedOption = false;
					customUresolverService.getRequest(_this.linkPrefix, JSON.stringify(_this.requestData)).then(
						data => {
							$scope.requestDataReceived = true;
							if (data.request_successful === true) {
								$scope.requestSuccessful = true;
								if (_this.logToConsole) console.log('This should really be displayed to the patron and then hide the request button');
							} else {
								$scope.requestSuccessful = false;
								if(typeof data.error_message !== 'undefined' && data.error_message != '') $scope.requestError = data.error_message;
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

		// determine if links is to resource sharing or online

		if (_this.parentCtrl.linksArray[0].getItTabText == "alma_tab1_unavail" ||
			_this.parentCtrl.linksArray[0].getItTabText == "alma_tab1_restrict") {
				$scope.isLinkToResourceSharing = true;
		} else if (_this.parentCtrl.linksArray[0].isLinktoOnline == true) {
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

		customUresolverService.getNzBib(_this.vid, _this.mms_id).then(
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
							if (holding.total_items != '') holding.numberItemsArray = new Array(parseInt(holding.total_items));
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

				$scope.localLocations.push({
					subLocation: _this.item.delivery.holding[i].subLocation,
					callNumber: _this.item.delivery.holding[i].callNumber.replace(/^\(|\)$/g, ''),
					availabilityStatus: _this.item.delivery.holding[i].availabilityStatus.replace(/^\(|\)$/g, ''),
					mms_id: mms_id
				});
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
						if (customUresolverDefault.rsForbiddenLocations[$scope.extLocations[i].organization][$scope.extLocations[i].locations[j].mainLocation].indexOf($scope.extLocations[i].locations[j].subLocationCode) === -1 && customUresolverDefault.rsForbiddenLocations[$scope.extLocations[i].organization][$scope.extLocations[i].locations[j].mainLocation].indexOf('*') === -1 && !$scope.hasNonForbiddenLocations) {
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
		getNzBib: function (vid, mms_id) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'get': 'nzbib', 'vid': vid, 'id': mms_id },
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
	bibURL: 'https://library.test.calstate.edu/primo-resolver/?',
	illURL: 'https://proxy.library.cpp.edu/login?url=https://illiad.library.cpp.edu/illiad/illiad.dll',
	rsForbiddenLocations: {
		'01CALS_PUP': {
			'SPEC': ['*']
		},
		'01CALS_UFR': {
			'CSUFRESNO1': ['nam']
		}
	}
});
