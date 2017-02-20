WolfApp.controller('ServiceController', function ($stateParams, $scope, $cookies, wolf) {
    $scope.routeName = $stateParams.route.replace(/-/g, '/');
    $scope.server = $stateParams.server;
    $scope.desc = '';
    $scope.page = false;
    $scope.validateSession = false;
    $scope.hasAsyncResponse = false;
    $scope.requests = [];
    $scope.responseCodes = [];
    $scope.responses = [];
    $scope.testInfo = '';
    $scope.testRequest = {};
    //
    var message = wolf.getMessage($scope.server);
    message.send('/wolf/service/info', {routeName: $scope.routeName}, function (res) {
        var obj = res.data.object;
        $scope.desc = obj.desc;
        $scope.page = obj.page;
        $scope.validateSession = obj.validateSession;
        $scope.hasAsyncResponse = obj.hasAsyncResponse;
        var compareFunc = function(obj1, obj2) {
            var result = 0;
            if(obj1.name && obj2.name) {
                result = obj1.name.localeCompare(obj2.name);
            }
            return result;
        };
        obj.requestConfigs.sort(compareFunc);
        obj.responseConfigs.sort(compareFunc);
        $scope.requests = obj.requestConfigs;
        $scope.responseCodes = obj.responseCodes;
        $scope.responses = obj.responseConfigs;
        angular.forEach($scope.requests, function (request) {
            $scope.testRequest[request.name] = '';
            if ($cookies[request.name]) {
                $scope.testRequest[request.name] = $cookies[request.name];
            }
        });
        $scope.$apply();
    });
    //
    $scope.test = function () {
        for (var name in $scope.testRequest) {
            $cookies[name] = $scope.testRequest[name];
        }
        //参数类型格式化
        var request;
        var testValue;
        for (var i = 0; i < $scope.requests.length; i++) {
            request = $scope.requests[i];
            testValue = $scope.testRequest[request.name];
            if (request.type.indexOf('LONG') > -1) {
                testValue = parseInt(testValue);
            } else if (request.type.indexOf('DOUBLE') > -1) {
                testValue = parseFloat(testValue);
            }
            $scope.testRequest[request.name] = testValue;
        }
        //处理三级请求数据
        message.send($scope.routeName, $scope.testRequest, function (res) {
            $scope.testInfo = angular.toJson(res, 4);
            $scope.$apply();
        });
    };
});