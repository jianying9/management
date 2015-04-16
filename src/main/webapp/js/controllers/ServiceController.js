WolfApp.controller('ServiceController', function ($stateParams, $rootScope, $scope, wolf) {
    $scope.routeName = $stateParams.route.replace(/-/g, '/');
    $scope.server = $stateParams.server;
    $scope.desc = '';
    $scope.page = false;
    $scope.session = false;
    $scope.requests = [];
    $scope.responseStates = [];
    $scope.responses = [];
    var message = wolf.getMessage($scope.server);
    message.send({route: '/wolf/service/info', routeName: $scope.routeName}, function (res) {
        $scope.desc = res.data.desc;
        $scope.page = res.data.page;
        $scope.session = res.data.validateSession;
        $scope.requests = res.data.requestConfigs;
        $scope.responseStates = res.data.responseStates;
        $scope.responses = res.data.responseConfigs;
        $scope.$apply();
    });
});