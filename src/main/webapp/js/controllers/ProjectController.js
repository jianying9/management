WolfApp.controller('ProjectController', function ($stateParams, $rootScope, $scope, wolf) {
    $scope.project = {};
    $scope.searchText = '';
    $scope.searchResult = $scope.services = [];
    $scope.server = $stateParams.server;
    var project;
    for (var index = 0, max = $rootScope.projects.length; index < max; index++) {
        project = $rootScope.projects[index];
        if (project.name === $scope.server) {
            $scope.project = project;
            break;
        }
    }
    $scope.$watch('searchText', function () {
        if ($scope.searchText) {
            var services = [];
            angular.forEach($scope.services, function (service) {
                if (service.routeName.indexOf($scope.searchText) >= 0 || service.groupName.indexOf($scope.searchText) >= 0 || service.desc.indexOf($scope.searchText) >= 0) {
                    services.push(service);
                }
            });
            $scope.searchResult = services;
        } else {
            $scope.searchResult = $scope.services;
        }
    });
    //
    var message = wolf.getMessage($scope.server);
    message.send('/wolf/service', {}, function (res) {
        angular.forEach(res.data.list, function (service) {
            service.route = service.routeName.replace(/\//g, '-');
        });
        $scope.searchResult = $scope.services = res.data.list;
        $scope.$apply();
    });
});