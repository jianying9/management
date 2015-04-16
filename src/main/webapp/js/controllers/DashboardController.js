'use strict';

WolfApp.controller('DashboardController', function ($scope, $rootScope) {
    var btnType = ['red', 'green', 'blue', 'purple'];
    var viewType = ['alert-success', 'alert-danger', 'alert-info', 'alert-warning'];
    $scope.projects = $rootScope.projects;
    var tIndex;
    for (var index = 0, max = $scope.projects.length; index < max; index++) {
        tIndex = index % viewType.length;
        $scope.projects[index].viewType = viewType[tIndex];
        tIndex = index % btnType.length;
        $scope.projects[index].btnType = btnType[tIndex];
    }
});