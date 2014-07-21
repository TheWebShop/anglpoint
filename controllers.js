appControllers.controller('ListCtrl', ['$scope', '$q', 'DataService', 'FillService', function($scope, $q, DataService, FillService) {
	
	// data bucket
	$scope.dataSet = [];
	
	// iterate over all models and fill data bucket
	for(var i = 0; i < models.length; i++) {
		var model = models[i].item;
		var restUrl = model.siteUrl + "/_vti_bin/listdata.svc/" + model.listName.replace(/\s+/g, '') + model.restParams;
		var promises = DataService.getData(model.listName, model.siteUrl, model.enableCaching, restUrl);
		$q.all(promises).then(function(res) {
			FillService.fillData(res[0], model.enableCaching, restUrl, res[1], res[2]).then(function(result) {
				$scope.dataSet = $scope.dataSet.concat(result);
			});
		});
	}
}]);
