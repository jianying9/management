/* Wolf App */
var WolfApp = angular.module("WolfApp", [
    'ui.router',
    'ui.bootstrap',
    'oc.lazyLoad',
    'ngSanitize',
    'ngCookies'
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
WolfApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        });
    }]);

/* Setup global settings */
WolfApp.factory('settings', ['$rootScope', function($rootScope) {
        // supported languages
        var settings = {
            layout: {
                pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
            },
            layoutImgPath: '../../../admin/layout/img/',
            layoutCssPath: '../../../admin/layout/css/'
        };

        $rootScope.settings = settings;
        return settings;
    }]);

WolfApp.factory('wolf', ['$rootScope', function($rootScope) {
        // supported languages
        var wolf = {
            getMessage: function(id) {
                return window.Wolf.getMessage(id);
            },
            addServer: function(server) {
                window.Wolf.addServer(server);
            }
        };
        return wolf;
    }]);

/* Setup App Main Controller */
WolfApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
//        Metronic.initComponents(); // init core components
    }]);

/* Setup Layout Part - Header */
WolfApp.controller('HeaderController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {
//            Layout.initHeader(); // init header
        });
    }]);

/* Setup Layout Part - Sidebar */
WolfApp.controller('PageHeadController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {
//        Demo.init(); // init theme panel
        });
    }]);

/* Setup Layout Part - Footer */
WolfApp.controller('FooterController', ['$scope', function($scope) {
        $scope.$on('$includeContentLoaded', function() {
//            Layout.initFooter(); // init footer
        });
    }]);

/* Setup Rounting For All Pages */
WolfApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        // Redirect any unmatched url
        $urlRouterProvider.otherwise("/dashboard.html");
        $stateProvider.state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "views/dashboard.html?${timestamp}",
            data: {pageTitle: 'Dashboard', pageSubTitle: '控制台'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/DashboardController.js?${timestamp}'
                            ]
                        });
                    }]
            }
        });
        $stateProvider.state('project', {
            url: "/project.html/:server",
            templateUrl: "views/project.html?${timestamp}",
            data: {pageTitle: 'Project', pageSubTitle: '项目'},
            controller: "ProjectController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/ProjectController.js?${timestamp}'
                            ]
                        });
                    }]
            }
        });
        $stateProvider.state('service', {
            url: "/service.html/:server/:route",
            templateUrl: "views/service.html?${timestamp}",
            data: {pageTitle: 'Service', pageSubTitle: '服务'},
            controller: "ServiceController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/ServiceController.js?${timestamp}'
                            ]
                        });
                    }]
            }
        });
        $stateProvider.state('push', {
            url: "/push.html/:server/:route",
            templateUrl: "views/push.html?${timestamp}",
            data: {pageTitle: 'Push', pageSubTitle: '推送服务'},
            controller: "PushController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/PushController.js?${timestamp}'
                            ]
                        });
                    }]
            }
        });
    }]);

/* Init global settings and run the app */
WolfApp.run(['$rootScope', '$state', 'settings', 'wolf', function($rootScope, $state, settings, wolf) {
        $rootScope.$state = $state;
        //初始化项目列表
        $rootScope.projects = [
            {
                name: '测试项目',
                desc: '测试websocket项目',
                httpUrl: 'http://127.0.0.1/test-server/api',
                websocketUrl: 'wss://127.0.0.1/test-server/api'
            },
            {
                name: '微项目',
                desc: '微项目服务端api',
                httpUrl: 'http://139.224.54.3/microproject-server/http/api',
                websocketUrl: 'wss://139.224.54.3/microproject-server/ws/api'
            }
        ];
        //
        var project;
        for (var index = 0, max = $rootScope.projects.length; index < max; index++) {
            project = $rootScope.projects[index];
            wolf.addServer({id: project.name, httpUrl: project.httpUrl, websocketUrl: project.websocketUrl});
        }
    }]);