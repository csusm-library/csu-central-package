(function () {
    "use strict";
    'use strict';


    angular.module('courseReserves', ['ui.router']);
    var app = angular.module('viewCustom', ['angularLoad', 'courseReserves', 'loginBackgrounds']);

    /****************************************************************************************************/

    /*In case of CENTRAL_PACKAGE - comment out the below line to replace the other module definition*/

    /*var app = angular.module('centralCustom', ['angularLoad']);*/

    /****************************************************************************************************/

    app.controller('prmLogoAfterController', [function () {
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
        template: '<div class="product-logo product-logo-local" layout="row" layout-align="start center" layout-fill id="banner"><a href="http://www.cpp.edu/~library/index.shtml"><img class="logo-image" alt="{{::(\'nui.header.LogoAlt\' | translate)}}" ng-src="{{$ctrl.getIconLink()}}"/></a></div>'
    });

    // Code from Fullerton to assist with Google Analytics
    app.run(function ($rootScope, $location, $state, $stateParams) {
        $rootScope.$on('$locationChangeSuccess', function (event, toState, fromState) {
            if (fromState != toState && ga) {
                console.log('$locationChangeSuccess | event: ', event);
                console.log('$locationChangeSuccess | referrerUrl: ', fromState);
                console.log('$locationChangeSuccess | newUrl: ', toState);
                console.log('$locationChangeSuccess | document.title: ', document.title);
                // _paq.push(['setReferrerUrl', fromState]);
                // _paq.push(['setCustomUrl', toState]);
                // // not all pages update the title, just main and journal searches.
                // _paq.push(['setDocumentTitle', document.title]);

                /*
                    // google analytics example, but simpler but possibly not as definitive  */
                ga('set', 'page', $location.url());
                ga('send', 'pageview');

                // alert( toState);

            }
        });
    });
    
	// Manually disable direct linking 
	//app.component('prmSearchResultAvailabilityLineAfter', {
	//	bindings: { parentCtrl: '<' },
	//	controller: 'prmSearchResultAvailabilityLineAfterController',
	//	template: 	''
	//});
    //
	//app.controller('prmSearchResultAvailabilityLineAfterController', ['$rootScope', function($rootScope){
	//	this.parentCtrl.result.delivery.availabilityLinks[0] = 'detailsGetit1'
	//}]);

	// Custom Fines/Fees link; First the original link has to be hidden and then the custom one gets created
	//hide the original link
	app.component('prmFinesAfter', {
		bindings: { parentCtrl: '<' },
		controller: 'prmFinesAfterController',
		template: 	''
	});

	//hide the original link
	app.controller('prmFinesAfterController', ['$rootScope', function($rootScope){
		this.parentCtrl.finesService._payFinesLink = ''
	}]);

	//replace the original link in the fines overview section
	app.run(['$templateCache', function ($templateCache) {
		$templateCache.put('components/account/overview/finesOverview/fines-overview.html', $templateCache.get('components/account/overview/finesOverview/fines-overview.html').replace('<md-button ng-if="$ctrl.payFinesLink" class="button-link" ng-href="{{$ctrl.payFinesLink}}" target="_blank" aria-label="Pay fines button"><span translate="fines.payfinelink"></span><prm-icon icon-type="{{$ctrl.accountIcons.externalLinkIcon.type}}" svg-icon-set="{{$ctrl.accountIcons.externalLinkIcon.iconSet}}" icon-definition="{{$ctrl.accountIcons.externalLinkIcon.icon}}"></prm-icon></md-button>', '<prm-fines-overview-inner parent-ctrl="$ctrl"></prm-fines-overview-inner>'));
	}]);

	//fines overview section link
	app.component('prmFinesOverviewInner', {
			bindings: { parentCtrl: '<' },
			controller: 'finesLinkController',
			template: 	'<md-button ng-if="$ctrl.hasFines && $ctrl.hasEmail && $ctrl.hasLink" class="button-as-link button-external-link inline-button" ng-href="{{::$ctrl.payFinesLink}}" target="_blank"><span translate="fines.payfinelink" style="top: 0;"></span><prm-icon icon-type="{{::$ctrl.parentCtrl.accountIcons.externalLinkIcon.type}}" svg-icon-set="{{::$ctrl.parentCtrl.accountIcons.externalLinkIcon.iconSet}}" icon-definition="{{::$ctrl.parentCtrl.accountIcons.externalLinkIcon.icon}}" style="top: -2px; position: relative;"></prm-icon></md-button>'
	});

	//fines tab section link
	app.component('prmAccountLinksAfter', {
			bindings: { parentCtrl: '<' },
			controller: 'finesLinkController',
			template: 	'<md-button ng-if="$ctrl.hasFines && $ctrl.hasEmail && $ctrl.hasLink" class="button-as-link button-external-link inline-button" ng-href="{{::$ctrl.payFinesLink}}" target="_blank"><span translate="fines.payfinelink" style="top: 0;"></span><prm-icon icon-type="{{::$ctrl.parentCtrl.accountIcons.externalLinkIcon.type}}" svg-icon-set="{{::$ctrl.parentCtrl.accountIcons.externalLinkIcon.iconSet}}" icon-definition="{{::$ctrl.parentCtrl.accountIcons.externalLinkIcon.icon}}" style="top: -2px; position: relative;"></prm-icon></md-button>'
	});

	//fines link controller
	app.controller('finesLinkController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){
		this.hasLink = false;
		this.hasFines = false;
		this.hasEmail = false;
		this.hideLinkBelowAmount = 5;
		if(this.parentCtrl.hasOwnProperty('finesOverviewService') || this.parentCtrl.tabName == 'fines') {
			this.finesService = $scope.$parent.$parent.$ctrl.finesService;
			this.getPayFinesLink = function (vid) {
				let payFinesLink = '';
				let payFinesConfig= this.finesService.mappingTablesCache.findByProperties('My Account Links', {source1: vid, source2: 'fines.payfinelink'});
				if (payFinesConfig.length === 0) { 
					payFinesConfig= this.finesService.mappingTablesCache.findByProperties('My Account Links', {source1: 'default', source2: 'fines.payfinelink'});
				}
				if (payFinesConfig.length > 0){
					payFinesLink = payFinesConfig[0].target;
				}
				if(payFinesLink != '') this.hasLink = true;
				return payFinesLink;
			}
			this.setFineTotal = function (response) {
				if(response.data) {
					let findFineTotal = response.data.listofactions.action.find(action => action.type === 'Fines')
					if(findFineTotal) this.fineTotal = findFineTotal.value
					this.payFinesLink = this.payFinesLink.replace('{{amount}}', this.fineTotal);
					if(this.fineTotal >= this.hideLinkBelowAmount) this.hasFines = true;
				}
			}
			
			this.setEmail = function (response) {
				if(response.data) {
					this.payFinesLink = this.payFinesLink.replace('{{email}}', response.data.email);
					this.hasEmail = true;
				}
			}
			
			this.fineTotal = 0
			this.userid = $rootScope.$$childTail.$ctrl.jwtUtilService.getDecodedToken().user
			this.payFinesLink = this.getPayFinesLink(this.finesService.vid).replace('{{userid}}', this.userid);
			this.finesService.accountService.makeIlsRequest('counters', null).then(response => this.setFineTotal(response))
			$http({method: 'GET', url: this.finesService.accountService.restBaseURLs.userSettingsBaseURL, params:{'vid':this.finesService.vid}}).then(response => this.setEmail(response));
		}
	}]);
	
	// Course reserves module
	angular.module('courseReserves')
	  .config(['$stateProvider',
		function ($stateProvider) {
		  $stateProvider
			.state('courses', {
			  url: '/courses?vid',
			  template: `
			  <title>{{getTitle(false, null)}}</title>
			  <style>prm-search-bar { display: none; }    md-input-container.text:after {background-color: #860038; width: 100%; transform: translate(-25%); height: 1px;} md-input-container.text.md-input-focused:after {height: 3px;}</style>
			  <prm-explore-main></prm-explore-main>
			  <md-content class="main _md md-primoExplore-theme layout-align-center-start" flex layout-padding>
				  <section section="courses" class="md-padding" layout="row" layout-xs="column" layout-align="center" flex>
					  <div ng-repeat="list in courseLists" flex>
						  <md-card>
							  <md-card-title layout="row" layout-xs="column">
								  <md-card-title-text flex>
									  <span class="md-headline">{{ list.title }}</span>
									  <span ng-if="list.courses.length > 0" class="md-title">{{ list.courses.length }} courses</span>
									  <span ng-if="list.courses.length === 0" class="md-title">No courses found.</span>
								  </md-card-title-text>
								  <md-card-title-text flex layout="row">
									  <md-input-container flex class="text">
										  <label>Search for instructor name or course name and number</label>
										  <input type="text" ng-model="searchFilter">
									  </md-input-container>
								  </md-card-title-text>
								  <md-card-title-text flex layout="row">
									  <md-input-container flex>
										  <label>Instructor:</label>
										  <md-select ng-model="instructorFilter">
											  <md-option ng-repeat="instructor in list.instructors" value="{{ instructor.primary_id }}" ng-selected="instructorFilter==instructor.primary_id">
												  {{ instructor.display }}
											  </md-option>
										  </md-select>
									  </md-input-container>
									  <md-input-container flex>
										  <label>Course code:</label>
										  <md-select ng-model="departmentFilter">
											  <md-option ng-repeat="department in list.departments" value="{{ department }}" ng-selected="departmentFilter==department">
												  {{ department }}
											  </md-option>
										  </md-select>
									  </md-input-container>
									  <md-input-container flex>
										  <label>Sort by:</label>
										  <md-select ng-model="sortType">
											  <md-option value="code">course number</md-option>
											  <md-option value="name">course name</md-option>
											  <md-option value="instructors[0].last_name">instructor</md-option>
										  </md-select>
									  </md-input-container>
								  </md-card-title-text>
							  </md-card-title>
							  <md-card-content ng-if="list.courses.length > 0">
								  <md-list flex>
									  <md-list-item class="md-3-line" ng-if="(filterList('department', course.department, departmentFilter)) && (filterList('instructor', course.instructors, instructorFilter)) && (filterList('search', course.searchable_ids, searchFilter))" ng-repeat="course in list.courses | orderBy : sortList(sortType)" ui-sref="course({cid : course.id, vid: vid})" aria-label="{{getAriaLabel(course)}}">
										  <div class="md-list-item-text" layout="column">
											  <ng-template ng-if="sortType !== 'name'">
												  <h3>{{ course.code }}</h3>
												  <h4>{{ course.name }}</h4>
											  </ng-template>
											  <ng-template ng-if="sortType === 'name'">
												  <h3>{{ course.name }}</h3>
												  <h4>{{ course.code }}</h4>
											  </ng-template>
											  <p ng-repeat="instructor in course.instructors" ng-if="course.instructors" class="md-title animate-if">
												  {{ instructor.last_name }}, {{ instructor.first_name }}
											  </p>
										  </div>
									  </md-list-item>
								  </md-list>
							  </md-card-content>
							  <md-card-content ng-if="list.courses.length <= 0">
								  <md-list flex>
									  <md-list-item class="md-3-line">
										  <div class="md-list-item-text" layout="column">
											<span class="md-headline">Loading courses...</span>
										  </div>
									  </md-list-item>
								  </md-list>
							  </md-card-content>
						  </md-card>
					  </div>
				  </section>
			  </md-content>`,
			  controller: 'reservesController'
			})
			.state('course', {
			  url: '/courses/:cid?vid',
			  template: `
			  <style>prm-search-bar { display: none; }</style>
			  <prm-explore-main></prm-explore-main>
			  <md-content class="main _md md-primoExplore-theme" flex layout-padding layout-align="center start">
				  <section section="course" flex class="md-padding" layout="column" layout-align="center">
					  <md-card ng-if="!course && !error" ng-cloak layout-align="center center">
						  <md-card-title>
							  <md-card-title-text>
								  <span class="md-headline">Loading course details...</span>
							  </md-card-title-text>
						  </md-card-title>
					  </md-card>
					  <md-card ng-if="error" ng-cloak layout-align="center center">
						  <md-card-title>
							  <md-card-title-text>
								  <span class="md-headline">{{error}}</span>
							  </md-card-title-text>
						  </md-card-title>
					  </md-card>
					  <md-card ng-if="course" class="animate-if" flex>
						  <title>{{getTitle(true, course)}}</title>
						  <md-card-title layout="row" layout-xs="column">
							  <md-card-title-text flex>
								  <span class="md-headline">{{ course.code }} - {{ course.name }}</span>
								  <span ng-repeat="instructor in instructors" ng-if="instructors" class="md-title animate-if">{{ instructor.last_name }}, {{ instructor.first_name }}</span>
							  </md-card-title-text>
							  <md-card-title-text flex>
								  <md-input-container>
									  <label>Sort by:</label>
									  <md-select ng-model="course.sortType">
										  <md-option ng-repeat="sortType in course.sortTypes" value="{{ sortType }}" ng-selected="$first">
											  {{ sortType }}
										  </md-option>
									  </md-select>
								  </md-input-container>
							  </md-card-title-text>
						  </md-card-title>
						  <md-card-content ng-if="course" class="animate-if">
							  <md-list flex>
								  <md-list-item item="item" ng-repeat="item in course.reserves | orderBy : course.sortType" ng-href="{{ item.link }}" class="md-3-line" >
									  <img ng-src="{{ item.cover }}" class="md-avatar animate-if" style="border-radius: initial; margin: 0 16px 0 0; height: 56px; width: 46px;"/>
									  <div class="md-list-item-text" layout="column">
										  <h3>{{ item.title }}</h3>
										  <p>
											  {{ item.author}}
										  </p>
										  <p ng-if="item.availability">
											  <span ng-style="{{ item.availability.style }}" class="animate-if">{{ item.availability.display }}</span>
											  <span class="animate-if"> - {{ item.availability.location }}</span>
											  <span ng-if="item.availability.call" class="animate-if" style="color: green; font-weight:bold;"> - {{ item.availability.call }}</span>
											  <p ng-if="item.availability.note">
												  <span class="animate-if">Note: {{ item.availability.note }}</span>
											  </p>
											  <p ng-if="item.availability.series">
												  <spanclass="animate-if">{{ item.availability.series }}</span>
											  </p>
										  </p>
										  <p ng-if="!item.availability">
											  <span class="animate-if"><i>Checking for item availability...</i></span>
										  </p>
									  </div>
								  </md-list-item>
							  </md-list>
						  </md-card-content>
						  <md-card-content ng-if="!course" class="animate-if">
							  No reserves found for this course.
						  </md-card-content>
					  </md-card>
				  </section>
			  </md-content>`,
			  controller: 'reservesController'
			})
		}
	  ])
	  .controller('reservesController', ['$window', '$scope', '$stateParams', 'reservesService',
		function ($window, $scope, $stateParams, reservesService) {
		  $scope.vid = $stateParams.vid
			//console.log($window.localStorage)
			//console.log($scope)
		  $scope.searchFilter = $window.localStorage.getItem('searchFilter') || ''
		  $scope.instructorFilter = $window.localStorage.getItem('instructorFilter') || 'all'
		  $scope.departmentFilter = $window.localStorage.getItem('departmentFilter') || 'all'
		  $scope.sortType = $window.localStorage.getItem('sortType') || 'code'
			//console.log($scope.searchFilter)
		  $scope.filterList = function(which, haystack, needle) {
			if(typeof needle == 'undefined') needle = ''
			
		   switch(which) {
				case 'search':
					//if($scope.searchFilter != needle) console.log($scope.searchFilter)
					if($scope.searchFilter != needle) $window.localStorage.setItem('searchFilter', needle)
					if($scope.searchFilter != needle) $scope.searchFilter = needle
					return (typeof needle == 'undefined' || !needle) ? true : (haystack.some(id => id.toLowerCase().indexOf(needle.toLowerCase()) >= 0)) ? true : false
					break
				case 'instructor':
					//if($scope.instructorFilter != needle) console.log($scope.instructorFilter)
					if($scope.instructorFilter != needle) $window.localStorage.setItem('instructorFilter', needle)
					if($scope.instructorFilter != needle) $scope.instructorFilter = needle
					return ((typeof needle == 'undefined' || !needle) ? true : ((needle == 'all') ? true : ((haystack.some(instructor => instructor.primary_id == needle)) ? true : false)))
					break
				case 'department':
					//if($scope.departmentFilter != needle) console.log($scope.departmentFilter)
					if($scope.departmentFilter != needle) $window.localStorage.setItem('departmentFilter', needle)
					if($scope.departmentFilter != needle) $scope.departmentFilter = needle
					return ((typeof needle == 'undefined' || !needle) ? true : ((needle == 'all') ? true : ((haystack == needle) ? true : false)))
					break
			}
		  }
		  $scope.getTitle = function(course) {
			  let title = 'Primo by Ex Libris - Course Reserves';
			  if(course) {
				  if(typeof course == 'undefined') return title;
				  title += ' - ' + course.code + ' ' + course.name;
			  }
			  return title;
		  }
		  $scope.sortList = function(sortType) {
			if(typeof sortType == 'undefined') sortType = 'code'
			//if($scope.sortType != sortType) console.log($scope.sortType)
			if($scope.sortType != sortType) $window.localStorage.setItem('sortType', sortType)
			if($scope.sortType != sortType) $scope.sortType = sortType
			return $scope.sortType
		  }
		  $scope.getAriaLabel = function(course) {
			if(typeof course == 'undefined') return '';
			let ariaLabel = course.code + ' ' + course.name + ';';
			for(var i = 0; i < course.instructors.length; i++) {
				ariaLabel += ' ' + course.instructors[i].display + ';';
			}
			return ariaLabel;
		  }
		  if($stateParams.cid) {
			reservesService.getCourse($scope.vid, $stateParams.cid).then(
			  course => {
				//console.log(course)
				$scope.error = (typeof course.errorsExist == 'undefined' || !course.errorsExist) ? null : course.errorList.error[0].errorMessage
				if(!$scope.error) {
				  $window.document.title = $scope.getTitle(course)
				  $scope.course = {code:course.code, name:course.name, sortTypes:['title', 'author']}
				  $scope.instructors = reservesService.makeArray(course.instructor)
				  $scope.course.reserves = reservesService.makeArray(course.reading_lists.reading_list[0].citations.citation)
				  $scope.course.reserves.map(
					item => {
					  item.title = item.metadata.title
					  item.author = item.metadata.author || item.metadata.additional_person_name
					  item.link = item.type.value != 'E_CR' ? reservesService.getLinkFromBib(item.metadata, item.type.value, $scope.vid) : item.open_url //a bit of a hack to prevent code duplication and allow items to be clicked before the availability resolves
					  reservesService.getBib($scope.vid, item.metadata.mms_id).then(
						bib => {
						  //console.log(bib)
						  //console.log(item)
						  item.title = item.title || bib.title
						  item.link = item.type.value != 'E_CR' ? reservesService.getLinkFromBib(bib, item.type.value, $scope.vid) || reservesService.getLinkFromTitle(item.title, $scope.vid) : item.open_url
						  item.availability = reservesService.getAvailability(bib, item.type.value)
						  item.loanType = reservesService.getLoanType(bib)
						  item.cover = reservesService.getCover(bib)
						}
					  )
					}
				  )
				}
			  }
			)
		  } else {
			$window.document.title = $scope.getTitle(false)
			$scope.courseLists = [{}]
			$scope.courseLists.map(
			  list => reservesService.getCourses($scope.vid).then(
				courses => {
				  list.courses = courses
				  list.instructors = reservesService.getInstructors(courses)
				  list.departments = reservesService.getDepartments(courses)
				  list.courses.map(
					course => {
					  course.department = reservesService.getCourseDepartment(course)
					  course.instructors = reservesService.makeArray(course.instructor)
					  course.searchable_ids = reservesService.getSearchableIDs(course)
					}
				  )
				}
			  )
			)
		  }
		}
	  ])
	  .factory('reservesService', ['$http', 'URLs',
		function ($http, URLs) {
		  return {
			/**
			 * Queries the Alma API to retrieve a list of courses based on a search filter.
			 * Requires a server-side wrapper function defined in URLs.courses.
			 * @param  {string} filter the search filter, e.g. 'searchableid~res'
			 * @return {promise}         list of matching courses
			 */
			getCourses: function (vid) {
			  return $http({
				method: 'GET',
				url: URLs.api,
				params: { 'vid': vid, 'get': 'courses' },
				cache: true
			  }).then(response => response.data)
			},
			/**
			 * Queries the Alma API to retrieve a course object using its cid.
			 * Requires a server-side wrapper function defined in URLs.reserves.
			 * @param  {string} cid course ID
			 * @return {promise}     course object
			 */
			getCourse: function (vid, cid) {
			  return $http({
				method: 'GET',
				url: URLs.api,
				params: { 'vid': vid, 'get': 'course', 'id': cid },
				cache: true
			  }).then(response => response.data)
			},
			/**
			 * Queries the Alma API to retrieve a bib using an item's MMSID.
			 * Requires a server-side wrapper function defined in URLs.bibs.
			 * @param  {string} mmsid item MMSID
			 * @return {promise}       bib object
			 */
			getBib: function (vid, mmsid) {
			  return $http({
				method: 'GET',
				url: URLs.api,
				params: { 'vid': vid, 'get': 'bib', 'id': mmsid },
				cache: true
			  }).then(response => response.data)
			},
			/**
			* Converts a parameter to array if not already an array.
			* Returns false if input was falsy (e.g. undefined)
			* @param  {any}  property    param to convert
			* @return {array}            converted param
			*/
			makeArray: function (property) {
			  return Array.isArray(property) ? property : property ? [property] : false
			},
			/**
			 * Extracts the set of unique academic departments from an array of courses.
			 * Used to generate the group_by menu.
			 * @param  {array} courses  array of course objects, e.g. from getCourses()
			 * @return {array}          array of department codes, e.g. ['BIO', 'CHEM' ...
			 */
			getSearchableIDs: function (course) {
			  let searchable_ids = new Set()
			  if(!course.searchable_id) {
				  course.searchable_id = []
			  }
			  this.makeArray(course.instructor).forEach(function(instructor) {course.searchable_id.push(instructor.display)})
			  course.searchable_id.push(course.code)
			  course.searchable_id.push(course.name)
			  course.searchable_id.map(searchable_id => searchable_ids.add(searchable_id))
			  return Array.from(searchable_ids)
			},
			/**
			 * Extracts the set of unique academic departments from an array of courses.
			 * Used to generate the group_by menu.
			 * @param  {array} courses  array of course objects, e.g. from getCourses()
			 * @return {array}          array of department codes, e.g. ['BIO', 'CHEM' ...
			 */
			getInstructors: function (courses) {
			  let instructors = new Set().add({primary_id:'all', first_name: '', last_name:'', display:'all'})
			  courses.map(course => this.getCourseInstructor(course).forEach(function(instructor) {let found = false; for(const inst of instructors) {if(instructor.primary_id == inst.primary_id) { found = true; break; }} found === false ? instructors.add(instructor) : ''}))
			  return Array.from(instructors).sort(function(a,b) {return (a.last_name > b.last_name) ? 1 : ((b.last_name > a.last_name) ? -1 : 0)} )
			},
			/**
			 * Gets the department code of a course.
			 * Uses a regex to delete non-word characters from the course code.
			 * @param  {object} course course object
			 * @return {string}        department code, e.g. 'BIO'
			 */
			getCourseInstructor: function (course) {
			  let instructors = this.makeArray(course.instructor)
			  instructors.map(instructor => instructor.display = instructor.last_name + ', ' + instructor.first_name)
			  return instructors
			  
			},
			/**
			 * Extracts the set of unique academic departments from an array of courses.
			 * Used to generate the group_by menu.
			 * @param  {array} courses  array of course objects, e.g. from getCourses()
			 * @return {array}          array of department codes, e.g. ['BIO', 'CHEM' ...
			 */
			getDepartments: function (courses) {
			  let departments = new Set().add('all')
			  courses.map(course => departments.add(this.getCourseDepartment(course)))
			  return Array.from(departments)
			},
			/**
			 * Gets the department code of a course.
			 * Uses a regex to delete non-word characters from the course code.
			 * @param  {object} course course object
			 * @return {string}        department code, e.g. 'BIO'
			 */
			getCourseDepartment: function (course) {
			  return course.code.split(' ')[0].toUpperCase()
			},
			/**
			* Gets the value of a MARC field in a bib.
			* Returns an array or false if field was not found.
			* Common fields:
			* ISBN (020)
			* Notes (500)
			* @param  {object} bib       bib object returned from getBib()
			* @param  {string} fieldName name or number of the MARC field to find
			* @return {array}            values(s) of the field
			*/
			getMarcField: function (bib, fieldName) {
			  let field = (typeof bib.record != 'undefined' && bib.record) ? bib.record.datafield.find(field => field.tag === fieldName) : false
			  return field ? this.makeArray(field.subfield) : false
			},
			/**
			* Get the availability of an item using a bib's AVA or AVE field.
			* E-resources use AVE, while physical resources use AVA.
			* Links to external resources will have type 'E_CR'.
			* @param  {object} bib       bib object returned from getBib()
			* @param  {string} type      type of the item, e.g. 'BK' for books
			* @return {string}           'unavailable' or 'available'
			*/
			getAvailability: function (bib, type) {
			  let availability = {
				location: '',
				call: '',
				note: '',
				series: '',
				display: 'unavailable',
				style: { color: 'orange' }
			  }
			  if(bib.holdings) {
				let num_available = 0
				bib.holdings.forEach(
				  function(holding) {
					if(availability.location != '' && availability.location != holding.location) {
					  availability.location = 'Multiple locations'
					} else availability.location = holding.location
					if(availability.call != '' && availability.call != holding.call_number) {
					  availability.call = false
					} else availability.call = holding.call_number
					if (holding.available == '1') {
					  num_available++
					}
				  }
				)
				availability.display = num_available + ' available'
				if(num_available < bib.holdings.length) {
				  availability.display = num_available + ' of ' + bib.holdings.length + ' available'
				}
				if(num_available > 0) availability.style.color = 'green'
				else {
				  let holdings = this.getMarcField(bib, 'AVE')
				  if(holdings) {
					  let edisplay = holdings.find(field => field.code === 'e')
					  let elocation = holdings.find(field => field.code === 't')
					  let eseries = holdings.find(field => field.code === 's')
					  let enote = holdings.find(field => field.code === 'n')
					  if(edisplay) availability.display = edisplay.value.toLowerCase()
					  if(elocation) availability.location = elocation.value
					  if(eseries) availability.series = eseries.value
					  if(enote) availability.note = enote.value
					  if(availability.display != 'unavailable') availability.style.color = 'green'
				  }
				}
				if(type === 'E_CR') availability.style.color = 'dodgerblue'
			  }
			  if(!bib.errorsExist && availability.location == '') {
				if(availability.display == '0 available') availability.display = 'available'
				availability.location = 'Check for ' + ((type == 'E_CR') ? 'article' : 'ebook') + ' availability'
			  }
			  return availability
			},
			/**
			* Get the loan type of an item by matching a bib's AVA field to a list.
			* External resources (e.g. e-books) won't have this value.
			* Requires a lookup table of codes defined in loanCodes.
			* @param  {object} bib       bib object returned from getBib()
			* @return {string}           a description of the loan, e.g. '3-hour loan'
			*/
			getLoanType: function (bib) {
			  let holdings = this.getMarcField(bib, 'AVA')
			  if (holdings) return holdings.find(field => field.code === 'c').value
			  return 'external resource'
			},
			/**
			 * Get a link to view an item.
			 * External resources will use the MARC 500 (notes) field as a URL.
			 * E-books and physical books will link to a search for the item in Primo.
			 * @param  {object} bib       bib object returned from getBib()
			 * @param  {string} type      type of the item, e.g. 'BK' for books
			 * @param  {string} vid       view name, e.g. LCC
			 * @return {string}           URL to the item
			 */
			getLinkFromBib: function (bib, type, vid) {
			  if (type === 'E_CR') {
				let ecrLink = this.getMarcField(bib, '500')
				return ecrLink ? ecrLink[0].value : ecrLink
			  }
			  if(bib.mms_id) return '/primo-explore/search?query=any,contains,' + bib.mms_id + '&vid=' + vid + '&sortby=rank'
			  return false
			},
			/**
			 * Get a link to view an item.
			 * Uses the title of the item as a failover if retrieving the bib fails.
			 * @param  {object} title     title of the item
			 * @param  {string} vid       view name, e.g. LCC
			 * @return {string}           URL to the item
			 */
			getLinkFromTitle: function (title, vid) {
			  return '/primo-explore/search?query=any,contains,' + encodeURI(title) + '&vid=' + vid + '&sortby=rank'
			},
			/**
			* Get a cover image URL for an item using its ISBN or MMSID.
			* Uses the bib record's leader to guess the resource type.
			* @param  {object} bib       bib object returned from getBib()
			* @return {string}           image URL
			*/
			getCover: function (bib) {
			  let isbn = this.getMarcField(bib, '020')[0]
			  //works, but exlibris doesn't provide extensive category images
			  //could use custom images, but that is outside the scope of this module at the moment
			  //for now just use the fallbak url
			  //let material_type = bib.holdings[0].material_type
			  //if (material_type) return URLs.covers_template.replace('{material_type}', material_type)
			  if (typeof bib.record != 'undefined' && bib.record && bib.record.leader[6] != 'a') return URLs.covers_fallback
			  if (isbn) return URLs.covers_syndetics + isbn.value + '/SC.JPG&client=primo'
			  return URLs.covers_fallback
			}
		  }
		}
	  ])
	  .run(
		function ($http) {
		  // Necessary for requests to succeed...not sure why
		  $http.defaults.headers.common = { 'X-From-ExL-API-Gateway': undefined }
		}
	  );
	angular.module('courseReserves').value('URLs', {
		//https://primocoursereservestest.000webhostapp.com/reserves.php?get=bib&id=991005054679702915&vid=01CALS_PUP
		//api: 'https://library.csudh.edu/testingp/almaapi.php?',
		api: 'https://libapps.cpp.edu/primoreserves/reserves.php?',
		covers_syndetics: 'https://syndetics.com/index.aspx?isbn=',
		covers_template: '/primo-explore/img/icon_{material_type}.png',
		covers_fallback: '/primo-explore/img/icon_book.png'
	});

/************************************** Testing Backgrounds **************************/

// Login Backgrounds:
app.constant('loginImages', ['librarydusk.jpg']);
               
angular.module('loginBackgrounds', []).component('prmStandAloneLoginAfter', {
  controller: ['loginBackgrounds', function (loginBackgrounds) {
    this.$onInit = function () {
      loginBackgrounds.setBackground();
    };
    this.$onDestroy = function () {
      loginBackgrounds.clearBackground();
    };
  }]
}).factory('loginBackgrounds', ['$document', '$stateParams', 'loginImages', function ($document, $stateParams, loginImages) {
  return {
    get bodyElement() {
      return angular.element($document.find('body')[0]);
    },
    setBackground: function setBackground() {
      var background = 'custom/' + $stateParams.vid + '/img/login/' + loginImages[Math.floor(Math.random() * loginImages.length)];
      this.bodyElement.css('background', 'url("' + background + '")');
      this.bodyElement.css('background-position', 'center');
      this.bodyElement.css('background-size', 'cover');
      this.bodyElement.css('background-repeat', 'no-repeat');
      return background;
    },
    clearBackground: function clearBackground() {
      this.bodyElement.css('background', '');
    }
  };
}]);

})();

// Google Analytics

(function (i, s, o, g, r, a, m) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
        (i[r].q = i[r].q || []).push(arguments)
    }, i[r].l = 1 * new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-18522228-7', 'auto');
ga('send', 'pageview');

