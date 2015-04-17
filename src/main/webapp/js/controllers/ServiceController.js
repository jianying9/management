WolfApp.controller('ServiceController', function ($stateParams, $scope, wolf) {
    $scope.routeName = $stateParams.route.replace(/-/g, '/');
    $scope.server = $stateParams.server;
    $scope.desc = '';
    $scope.page = false;
    $scope.session = false;
    $scope.requests = [];
    $scope.responseStates = [];
    $scope.responses = [];
    $scope.testInfo = '';
    $scope.testRequest = {};
    //
    var message = wolf.getMessage($scope.server);
    message.send({route: '/wolf/service/info', routeName: $scope.routeName}, function (res) {
        $scope.desc = res.data.desc;
        $scope.page = res.data.page;
        $scope.session = res.data.validateSession;
        $scope.requests = res.data.requestConfigs;
        $scope.responseStates = res.data.responseStates;
        $scope.responses = res.data.responseConfigs;
        angular.forEach($scope.requests, function (request) {
            $scope.testRequest[request.name] = '';
        });
        $scope.$apply();
    });
    //
    $scope.test = function () {
        $scope.testRequest.route = $scope.routeName;
        message.send($scope.testRequest, function (res) {
            $scope.testInfo = angular.toJson(res, 4);
            $scope.$apply();
        });
    };
});