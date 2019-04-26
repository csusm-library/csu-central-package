angular.module('customUresolver', []);

angular.module('customUresolver').component('csuCustomUresolver', {
	bindings: {
		parentCtrl: '<'
	},
	templateUrl: 'custom/CENTRAL_PACKAGE/html/module.customUresolver.html',
	controller: ['$scope', '$sce', 'customUresolverService', function ($scope, $sce, customUresolverService) {
		var _this = this;

		_this.vid = _this.parentCtrl.configurationUtil.vid;
		_this.item = $scope.$parent.$parent.$parent.$parent.$ctrl.item;
		_this.link = _this.parentCtrl.linksArray[0].link;
		_this.loginService = $scope.$root.$$childHead.$$childHead.$$nextSibling.$ctrl.loginIframeService.loginService;
		$scope.isLinktoOnline = false;
		$scope.isLinkToResourceSharing = false;
		_this.tempExt = [];
		_this.mms_id = _this.item.pnx.display.hasOwnProperty('lds04') ? _this.item.pnx.display.lds04[0] : null;
		_this.logToConsole = false;
		$scope.hasLocal = false;
		$scope.preholdings = _this.item.delivery.holding.filter(function(holding, index) {return holding.organization == _this.vid.substring(0, 10)});
		$scope.localLocations = [];
		$scope.extLocations = [];
		$scope.showCompact = false;
		$scope.showExtHoldings = false;
		$scope.showResourceSharing = false;
		_this.toggleShowItems = function (holding, event = false) {
			if(event != false && event.keyCode !== 13 && event.keyCode !== 32) return;
			holding.showItems = holding.showItems ? false : true;
			if(event != false) event.preventDefault();
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

		// determine if links is to resource sharing or online

		if (_this.parentCtrl.linksArray[0].getItTabText == "alma_tab1_unavail" ||
			_this.parentCtrl.linksArray[0].getItTabText == "alma_tab1_restrict") {
				$scope.isLinkToResourceSharing = true;
		} else if (_this.parentCtrl.linksArray[0].isLinktoOnline == true) {
			$scope.isLinktoOnline = true;
		}

		/**
		 * Get detailed holdings information from the API
		 * Includes detailed info for local holdings only
		 */
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
									holding.showItems = false
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
				let mms_id = _this.item.pnx.display.lds04;
				$scope.hasLocal = true;
				$scope.localLocations.push({
					subLocation: _this.item.delivery.holding[i].subLocation,
					callNumber: _this.item.delivery.holding[i].callNumber.replace(/^\(|\)$/g, ''),
					availabilityStatus: _this.item.delivery.holding[i].availabilityStatus.replace(/^\(|\)$/g, ''),
					mms_id: mms_id
				});
			} else {
				let mms_id = _this.item.pnx.display.lds03.find(function(item) {return item.search(_this.item.delivery.holding[i].organization) >= 0 ? true : false}, _this);

				if (typeof _this.tempExt['length'] == 'undefined') {
					_this.tempExt['length'] = 0
				}

				if (typeof _this.tempExt[_this.item.delivery.holding[i].organization] == 'undefined') {
					_this.tempExt[_this.item.delivery.holding[i].organization] = {
						organization: _this.item.delivery.holding[i].organization,
						locations: []
					}
				}

				_this.tempExt[_this.item.delivery.holding[i].organization].locations.push({
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
			'01CALS_UNO': 'Northridge'
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

		$scope.consortiaHoldings = [];

		for (var i = 0; i < $scope.extLocations.length; i++) {
			for (var j = 0; j < $scope.extLocations[i].locations.length; j++) {
				$scope.extLocations[i].locations[j].campus = _this.campus_names[$scope.extLocations[i].organization];
				$scope.consortiaHoldings.push($scope.extLocations[i].locations[j]);
			}
		}

		// sorted by readable campus name

		$scope.extLocations.sort(function(a, b) {
			if (a.campus < b.campus)
				return -1;
			if (a.campus > b.campus)
				return 1;
			return 0;
		});

		_this.tempExt = null;

		// user logged-in

		var rootScope = $scope.$root;
		var uSMS = rootScope.$$childHead.$ctrl.userSessionManagerService;
		var jwtData = uSMS.jwtUtilService.getDecodedToken();
		$scope.userIsLoggedIn = jwtData.userName ? true: false;
		console.log('userIsLoggedIn:' + $scope.userIsLoggedIn)

		// resource sharing
		// there are other holdings and not locally available

		if ($scope.consortiaHoldings.length > 0 && (
			_this.item.delivery.availability[0] != "available_in_my_institution" &&
			_this.item.delivery.availability[0] != "available_in_maininstitution" &&
			_this.item.delivery.availability[0] != "available_in_institution" &&
			_this.item.delivery.availability[0] != "not_restricted")) {
				$scope.showResourceSharing = true;
		 }

		console.log('links array:');
 		console.log(_this.parentCtrl.linksArray);
		console.log('link: ' + _this.link);
		console.log('isLinkToOnline: ' + $scope.isLinktoOnline);
		console.log('isLinkToResourceSharing: ' + $scope.isLinkToResourceSharing);
		console.log('availability: ' + _this.item.delivery.availability[0]);
		console.log('showResourceSharing: ' + $scope.showResourceSharing);
	}]
})
.factory('customUresolverService', ['$http', 'customUresolver', 'customUresolverDefault', function ($http, customUresolver, customUresolverDefault) {
	return {
		getNzBib: function (vid, mms_id) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'vid': vid, 'get': 'nzbib', 'id': mms_id },
				cache: true
			}).then(response => response.data)
		},
		getBib: function (vid, mms_id) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'vid': vid, 'get': 'bib', 'id': mms_id },
				cache: true
			}).then(response => response.data)
		},
		getHoldingNote: function (vid, mms_id, holdingid) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'vid': vid, 'get': 'holdingnote', 'id': mms_id, 'id2': holdingid },
				cache: true
			}).then(response => response.data)
		},
		getStatus: function (vid, mms_id, holdingid) {
			return $http({
				method: 'GET',
				url: customUresolver.hasOwnProperty("bibURL") ? customUresolver.bibURL : customUresolverDefault.bibURL,
				params: { 'vid': vid, 'get': 'status', 'id': mms_id, 'id2': holdingid },
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
	enabled: true,
	bibURL: 'https://library.test.calstate.edu/primo-resolver/bibapi.php?'
	//
});
