WolfApp.controller('ProjectController', function ($stateParams, $rootScope, $scope, $cookies, wolf) {
    $scope.project = {};
    $scope.searchText = '';
    if ($cookies['searchText']) {
        $scope.searchText = $cookies['searchText'];
    }
    $scope.searchResult = $scope.services = [];
    $scope.routeGroups = [];
    $scope.server = $stateParams.server;
    var project;
    for (var index = 0, max = $rootScope.projects.length; index < max; index++) {
        project = $rootScope.projects[index];
        if (project.name === $scope.server) {
            $scope.project = project;
            break;
        }
    }
    var searchTextFilter = function (searchText) {
        if (searchText) {
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
    };
    $scope.$watch('searchText', function () {
        $cookies['searchText'] = $scope.searchText;
        searchTextFilter($scope.searchText);
    });
    $scope.changeSearchText = function(routeGroup) {
        $scope.searchText = routeGroup;
    };
    //
    var message = wolf.getMessage($scope.server);
    message.send('/wolf/service', {}, function (res) {
        //计算接口的分类
        var routeGroupMap = {};
        var routeGroup;
        angular.forEach(res.data.list, function (service) {
            service.route = service.routeName.replace(/\//g, '-');
            routeGroup = service.routeName.substr(0, service.routeName.lastIndexOf('/'));
            routeGroup = routeGroup.substr(0, routeGroup.lastIndexOf('/'));
            while(routeGroup.split('/').length > 3) {
                routeGroup = routeGroup.substr(0, routeGroup.lastIndexOf('/'));
            }
            routeGroupMap[routeGroup] = true;
        });
        var routeGroups = [];
        for(var routeGroup in routeGroupMap) {
            routeGroups.push(routeGroup);
        }
        $scope.routeGroups = routeGroups;
        //保存所有接口
        $scope.services = res.data.list;
        searchTextFilter($scope.searchText);
        $scope.$apply();
    });
});