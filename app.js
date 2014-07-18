'use strict';

var app = angular.module('anglpoint-app', []);

/*	controller provides data to app
	@ requires enableCaching, listName, siteUrl, restParams
*/
app.controller('ListCtrl', ['$scope', '$q', 'DataService', 'FillService', function($scope, $q, DataService, FillService) {

	// the following 4 variables must be initialized by user
	var enableCaching = true; // set to true to enable caching
	var listName = "Some List"; // List name exactly as created in SharePoint
	var siteUrl = "/some/site/url"; // relative site URL
	var restParams = ""; // parameters for REST operation
	
	var restUrl = siteUrl + "/_vti_bin/listdata.svc/" + listName.replace(/\s+/g, '') + restParams;
	$scope.dataSet = []; // bucket to hold data for stage

	var promises = DataService.getData(listName, siteUrl, enableCaching, restUrl);

	$q.all(promises).then(function(res) {
		$scope.dataSet = FillService.fillData(res[0], enableCaching, restUrl, res[1], res[2]);
	});
	
}]);

/*	provides data (as promise) to requesting controller
	@ function: getData(list name, relative site URL, cache flag, cache reference)
	@ 			returns promise object
*/
app.service('DataService', ['$q', '$http', 'CacheService', function($q, $http, CacheService) {
	this.getData = function(name, site, cache, url) {
	
		var updated = $q.defer(); // updated date
		var flag = $q.defer(); // flag for cache update
		var data = $q.defer(); // results of operation
		
		ExecuteOrDelayUntilScriptLoaded(function() {
			var ctx = new SP.ClientContext(site);
			var web = ctx.get_web();
			var list = web.get_lists().getByTitle(name);
			ctx.load(list);
			ctx.executeQueryAsync( function() {
				var dateUpdated = Date.parse(list.get_lastItemModifiedDate());
				var dateStored = CacheService.getCache(url + "-updated");
				updated.resolve(dateUpdated);			
				// determine if situation is favorable to retrieve cached data
				if(cache && CacheService.getCache(url + "-data") && (dateStored - dateUpdated) == 0) {
					// cache meets criteria
					flag.resolve(false);
					data.resolve(JSON.parse(CacheService.getCache(url + "-data")));
				} else {
					// no caching or data out-of-date, de facto operation
					flag.resolve(true);
					data.resolve($http.get(url));
				}				
			}, function() {
				// error handling for failed async operation
				alert("something went horribly wrong! :(");
			});
		}, 'sp.js');
		return [data.promise, updated.promise, flag.promise];
	}
}]);

/*	provides caching operations to requesting service 
	@ function: getCache(key)
				return value for key
	@ function: setCache(key, value)
				no return 
*/
app.service('CacheService', [function() {
	this.getCache = function(key) {
		return localStorage.getItem(key);
	}
	this.setCache = function(key, value) {
		localStorage.setItem(key, value);
	}
}]);

/*	fills data into an array, cache if enabled
	@ function: fillData(data object, cache flag, cache reference, data date, data validity)
				return array containing data	
*/

app.service('FillService', ['CacheService', function(CacheService) {
	this.fillData = function(data, cache, ref, date, flag) {
		// iterate over data and fill array and cache if enabled
		var arr = [];
		for (var i = 0; i < data.data.d.results.length; i++) {
			arr.push(data.data.d.results[i]);
		}
		
		// cache data if flag has been set
		if (cache && flag) {
			CacheService.setCache(ref + "-updated", date); // store date for reference
			CacheService.setCache(ref + "-data", JSON.stringify(data)); // store data
		}
		return arr;
	}
}]);
