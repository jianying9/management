/* Wolf App */
var WolfApp = angular.module("WolfApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize"
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
WolfApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        });
    }]);

/* Setup global settings */
WolfApp.factory('settings', ['$rootScope', function ($rootScope) {
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

WolfApp.factory('wolf', ['$rootScope', function ($rootScope) {
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
WolfApp.controller('AppController', ['$scope', '$rootScope', function ($scope, $rootScope) {
//        Metronic.initComponents(); // init core components
    }]);

/* Setup Layout Part - Header */
WolfApp.controller('HeaderController', ['$scope', function ($scope) {
        $scope.$on('$includeContentLoaded', function () {
//            Layout.initHeader(); // init header
        });
    }]);

/* Setup Layout Part - Sidebar */
WolfApp.controller('PageHeadController', ['$scope', function ($scope) {
        $scope.$on('$includeContentLoaded', function () {
//        Demo.init(); // init theme panel
        });
    }]);

/* Setup Layout Part - Footer */
WolfApp.controller('FooterController', ['$scope', function ($scope) {
        $scope.$on('$includeContentLoaded', function () {
//            Layout.initFooter(); // init footer
        });
    }]);

/* Setup Rounting For All Pages */
WolfApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        // Redirect any unmatched url
        $urlRouterProvider.otherwise("/dashboard.html");
        $stateProvider.state('dashboard', {
            url: "/dashboard.html",
            templateUrl: "views/dashboard.html",
            data: {pageTitle: 'Dashboard', pageSubTitle: '控制台'},
            controller: "DashboardController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/DashboardController.js'
                            ]
                        });
                    }]
            }
        });
        $stateProvider.state('project', {
            url: "/project.html/:server",
            templateUrl: "views/project.html",
            data: {pageTitle: 'Project', pageSubTitle: '项目'},
            controller: "ProjectController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/ProjectController.js'
                            ]
                        });
                    }]
            }
        });
        $stateProvider.state('service', {
            url: "/service.html/:server/:route",
            templateUrl: "views/service.html",
            data: {pageTitle: 'Service', pageSubTitle: '服务'},
            controller: "ServiceController",
            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            name: 'WolfApp',
                            insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                            files: [
                                'js/controllers/ServiceController.js'
                            ]
                        });
                    }]
            }
        });
    }]);

/* Init global settings and run the app */
WolfApp.run(['$rootScope', '$state', 'settings', 'wolf', function ($rootScope, $state, settings, wolf) {
        $rootScope.$state = $state;
        //初始化项目列表
        $rootScope.projects = [
            {
                name: '测试工程',
                desc: '测试websocket工程',
                httpUrl: 'http://139.224.54.3/test-server/api'
            }
        ];
        //
        var project;
        for (var index = 0, max = $rootScope.projects.length; index < max; index++) {
            project = $rootScope.projects[index];
            wolf.addServer({id: project.name, httpUrl: project.httpUrl});
        }
    }]);