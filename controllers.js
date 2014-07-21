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
