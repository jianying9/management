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
    message.send({route: '/wolf/service/info', routeName: $scope.routeName}, function (res) {
        $scope.desc = res.data.desc;
        $scope.page = res.data.page;
        $scope.validateSession = res.data.validateSession;
        $scope.hasAsyncResponse = res.data.hasAsyncResponse;
        $scope.requests = res.data.requestConfigs;
        $scope.responseCodes = res.data.responseCodes;
        $scope.responses = res.data.responseConfigs;
        angular.forEach($scope.requests, function (request) {
            $scope.testRequest[request.name] = '';
            if($cookies[request.name]) {
                $scope.testRequest[request.name] = $cookies[request.name];
            }
        });
        $scope.$apply();
    });
    //
    $scope.test = function () {
        $scope.testRequest.route = $scope.routeName;
        for(var name in $scope.testRequest) {
            $cookies[name] = $scope.testRequest[name];
        }
        message.send($scope.testRequest, function (res) {
            $scope.testInfo = angular.toJson(res, 4);
            $scope.$apply();
        });
    };
});