WolfApp.controller('PushController', function ($stateParams, $scope, wolf) {
    $scope.routeName = $stateParams.route.replace(/-/g, '/');
    $scope.server = $stateParams.server;
    $scope.desc = '';
    $scope.responses = [];
    $scope.serviceArray = [];
    //
    var message = wolf.getMessage($scope.server);
    message.send('/wolf/push/info', {routeName: $scope.routeName}, function (res) {
        var obj = res.data;
        $scope.desc = obj.desc;
        var compareFunc = function(obj1, obj2) {
            var result = 0;
            if(obj1.name && obj2.name) {
                result = obj1.name.localeCompare(obj2.name);
            }
            return result;
        };
        obj.responseArray.sort(compareFunc);
        angular.forEach(obj.serviceArray, function (routeName) {
            var service = {
                routeName: routeName,
                route: routeName.replace(/\//g, '-')
            };
            $scope.serviceArray.push(service);
        });
        $scope.responses = obj.responseArray;
        $scope.$apply();
    });
});