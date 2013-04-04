var adminApp = angular.module('adminApp', []).
  config(function($routeProvider, $locationProvider) {

    $routeProvider.otherwise( {
        controller: 'adminController',
    });

});

function adminController($scope, $http, $timeout, $filter) {
    $scope.predicate = '-timestamp.$date';

    $http.get('admin-handler.cgi', {params: {action: 'get_signups'}}).
        success(function(data, status, headers, config) {
            if (data.response) {
                $scope.signups = data.response;
            } else {
                $scope.signups = null;
            }
        }).
        error(function(data, status, headers, config) {
            $scope.signups = null;
    });

    $scope.getAge = function (birthday) {
        var then = moment(birthday, 'YYYY-MM-DD');
        var now = moment();
        if (!then || !then.isValid()) {
            return birthday;
        }
        var ms = now.diff(then, 'milliseconds', true);
        var years = Math.floor(moment.duration(ms).asYears());
        now = now.subtract('years', years);
        ms = now.diff(then, 'milliseconds', true);
        var months = Math.floor(moment.duration(ms).asMonths());
        if (years > 0) {
            return years + ' years, ' + months + ' months';
        } else {
            return months + ' months';
        }
    };

    $scope.markReceived = function(signupData) {
        var index = _.indexOf($scope.signups, signupData);
        var params = { 
            action: 'mark_received',
            oid: signupData._id.$oid,
        }
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data, status, headers, config) {
                if (data.response) {
                    $scope.signups[index].payment_received = true;
                }
        });
    };

    $scope.saveNotes = function(signupData) {
        var index = _.indexOf($scope.signups, signupData);
        $scope.signups[index].savingNotes = true;
        var params = { 
            action: 'save_notes',
            oid: signupData._id.$oid,
            notes: signupData.notes,
        }
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data, status, headers, config) {
                if (data.response) {
                    $scope.signups[index].savingNotesAlert = false;
                    $scope.signups[index].savingNotesSuccess = true;
                    $timeout(function() { 
                        $scope.signups[index].savingNotesSuccess = false; 
                    }, 2000);
                } else {
                    $scope.signups[index].savingNotesAlert = true;
                }
            }).
            error(function(data, status, headers, config) {
                $scope.signups[index].savingNotesAlert = true;
        });
        $scope.signups[index].savingNotes = false;
    };

    $scope.getSignupsCount = function(type) {
        var matched = $filter('filter')($scope.signups, $scope.searchText);
        if (!matched) {
            return 0;
        }
        switch (type) {
            case 'unpaid':
                var matched = _.where(matched, {payment_received: false});
                break;
            case 'paid':
                var matched = _.where(matched, {payment_received: true});
                break;
            case 'card':
                var matched = _.filter(matched, function(obj){ return obj.customer_id });
                break;
            case 'cash':
                var matched = _.filter(matched, function(obj){ return !obj.customer_id });
                break;
            case 'culverCity':
                var matched = _.where(matched, {'location': 'culverCity'});
                break;
            case 'laCrescenta':
                var matched = _.where(matched, {'location': 'laCrescenta'});
                break;
        }
        return matched ? matched.length : 0;
    };
}
