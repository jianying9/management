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
    $scope.testJsonLine = 6;
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
        $scope.testJsonLineNum = obj.requestArray.length + 2;
        var testParam = {};
        var getChildParam = function (parentName, requests) {
            var result = {};
            angular.forEach(requests, function (request) {
                if (request.name.indexOf(parentName) === 0) {
                    var childName = request.name.substring(parentName.length + 1);
                    if (childName.indexOf('.') === -1 && childName.length > 0) {
                        switch (request.type) {
                            case 'OBJECT':
                                result[childName] = createChildParam(request, requests);
                                break;
                            case 'OBJECT_ARRAY':
                                result[childName] = createChildParam(request, requests);
                                break;
                            case 'STRING_ARRAY':
                                $scope.testJsonLineNum += 2;
                                result[childName] = [''];
                                break;
                            case 'LONG_ARRAY':
                                $scope.testJsonLineNum += 2;
                                result[childName] = [-1];
                                break;
                            case 'BOOLEAN':
                                result[childName] = true;
                                break;
                            case 'LONG':
                                result[childName] = -1;
                                break;
                            default:
                                result[childName] = '';
                        }
                        $scope.$apply();
                    }
                }
            });
            return result;
        };
        var createChildParam = function (parentRequest, requests) {
            $scope.testJsonLineNum += 2;
            var result;
            if (parentRequest.type === 'OBJECT') {
                result = getChildParam(parentRequest.name, requests);
            } else if (parentRequest.type === 'OBJECT_ARRAY') {
                var child = getChildParam(parentRequest.name, requests);
                result = [];
                result.push(child);
            }
            return result;
        };
        angular.forEach(obj.requestArray, function (request) {
            var paramName = request.name;
            if (paramName.indexOf('.') === -1 && paramName.length > 0) {
                switch (request.type) {
                    case 'OBJECT':
                        testParam[paramName] = createChildParam(request, obj.requestArray);
                        break;
                    case 'OBJECT_ARRAY':
                        testParam[paramName] = createChildParam(request, obj.requestArray);
                        break;
                    case 'STRING_ARRAY':
                        $scope.testJsonLineNum += 2;
                        testParam[paramName] = [''];
                        break;
                    case 'LONG_ARRAY':
                        $scope.testJsonLineNum += 2;
                        testParam[paramName] = [-1];
                        break;
                    case 'BOOLEAN':
                        testParam[paramName] = true;
                        break;
                    case 'LONG':
                        testParam[paramName] = -1;
                        break;
                    default:
                        testParam[paramName] = '';
                }
                $scope.$apply();
            }
        });
        $scope.testJson = angular.toJson(testParam, 4);
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