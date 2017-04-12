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
    var requestJson = {
        route: '/app/route',
        callback: '请求唯一标识,jsonp中也是回调函数名(非必要)',
        md5: '数据变化校验(非必要)',
        param: {
            param1: "业务接口传参数位置,可以是任意的json,具体看每个接口定义",
            param2: 100,
            param3: true,
            param4: {},
            param5: []
        }
    };
    $scope.requestJson = angular.toJson(requestJson, 4);
    //
    var httpRequestJson = {
        param1: "业务接口传参数位置,可以是任意的json,具体看每个接口定义",
        param2: 100,
        param3: true,
        param4: {},
        param5: []
    };
    $scope.httpRequestJson = angular.toJson(httpRequestJson, 4);
    //
    var responseJson = {
        route: '/app/route',
        code: '返回操作结果标识:unlogin-未登录,invalid-非法参数,timeout-session过期,unmoifyed-数据没有变化,notfound-route对应的服务不存在',
        callback: '如果请求有callback,那么响应就会返回请求标识,jsonp中也会用到',
        md5: '如果请求参数有md5,响应的数据如果有新的变化,则会返回最新的md5值',
        data: {
            param1: "返回业务数据,可以是任意的json,具体看每个接口的定义",
            param2: 100,
            param3: true,
            param4: {},
            param5: []
        }
    };
    $scope.responseJson = angular.toJson(responseJson, 4);
    //
    var pushJson = {
        route: '/push/route',
        pushId: '推送id',
        data: {
            param1: "返回业务数据,可以是任意的json,具体看每个接口的定义",
            param2: 100,
            param3: true,
            param4: {},
            param5: []
        }
    };
    $scope.pushJson = angular.toJson(pushJson, 4);
});