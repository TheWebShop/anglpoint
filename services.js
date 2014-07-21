'use strict';

var appServices = angular.module('anglpointApp.services', []);

/*	provides data (as promise) to requesting controller
	@ function: getData(list name, relative site URL, cache flag, cache reference)
	returns promise object
*/
appServices.service('DataService', ['$q', '$http', 'CacheService', function($q, $http, CacheService) {
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
appServices.service('CacheService', [function() {
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
appServices.service('FillService', ['$q', 'CacheService', function($q, CacheService) {
	this.fillData = function(data, cache, ref, date, flag) {
		// iterate over data and fill array and cache if enabled
		var arr = [];
		var dpromise = $q.defer();
		
		for (var i = 0; i < data.data.d.results.length; i++) {
			arr.push(data.data.d.results[i]);
		}
					
		// cache data if flag has been set
		if (cache && flag) {
			CacheService.setCache(ref + "-updated", date); // store date for reference
			CacheService.setCache(ref + "-data", JSON.stringify(data)); // store data
		}
		dpromise.resolve(arr);
		return dpromise.promise;
	}
}]);
