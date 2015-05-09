var DemoApp = angular.module('DemoApp', ['angularFlatCharts']);

DemoApp.controller('DemoController', ['$scope',
    function ($scope) {
        $scope.data = [
            { 'x': 1, 'y': 10 },
            { 'x': 2, 'y': 11 },
            { 'x': 3, 'y': 15 },
            { 'x': 4, 'y': 0 },
            { 'x': 5, 'y': 6 },
            { 'x': 6, 'y': 7 },
            { 'x': 7, 'y': 3 },
            { 'x': 8, 'y': 5 },
            { 'x': 9, 'y': 8 },
            { 'x': 10, 'y': 3 },
            { 'x': 11, 'y': 10 },
            { 'x': 12, 'y': 18 },
            { 'x': 13, 'y': 14 },
            { 'x': 14, 'y': 1 },
            { 'x': 15, 'y': 10 }
        ];
    }
]);