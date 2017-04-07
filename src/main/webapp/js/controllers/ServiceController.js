WolfApp.controller('ServiceController', function ($stateParams, $scope, $cookies, wolf) {
    $scope.routeName = $stateParams.route.replace(/-/g, '/');
    $scope.server = $stateParams.server;
    $scope.desc = '';
    $scope.validateSession = false;
    $scope.hasAsyncResponse = false;
    $scope.requests = [];
    $scope.responseCodes = [];
    $scope.responses = [];
    $scope.pushArray = [];
    $scope.testInfo = '';
    $scope.testJson = "{}";
    if ($cookies[$scope.routeName]) {
        $scope.testJson = $cookies[$scope.routeName];
    }
    //
    var message = wolf.getMessage($scope.server);
    message.send('/wolf/service/info', {routeName: $scope.routeName}, function (res) {
        var obj = res.data;
        $scope.desc = obj.desc;
        $scope.validateSession = obj.validateSession;
        $scope.hasAsyncResponse = obj.hasAsyncResponse;
        var compareFunc = function (obj1, obj2) {
            var result = 0;
            if (obj1.name && obj2.name) {
                result = obj1.name.localeCompare(obj2.name);
            }
            return result;
        };
        obj.requestArray.sort(compareFunc);
        obj.responseArray.sort(compareFunc);
        angular.forEach(obj.pushArray, function (push) {
            push.route = push.routeName.replace(/\//g, '-');
        });
        $scope.requests = obj.requestArray;
        $scope.responseCodes = obj.codeArray;
        $scope.responses = obj.responseArray;
        $scope.pushArray = obj.pushArray;
        $scope.$apply();
    });
    //
    $scope.test = function () {
        //参数类型格式化
        if ($scope.testJson === '') {
            $scope.testJson = '{}';
        } else {
            $cookies[$scope.routeName] = $scope.testJson;
        }
        var param = angular.fromJson($scope.testJson);
        //处理三级请求数据
        message.send($scope.routeName, param, function (res) {
            $scope.testInfo = angular.toJson(res, 4);
            $scope.$apply();
        });
    };
});