var adminApp = angular.module('adminApp', []).
  config(function($routeProvider, $locationProvider) {

    $routeProvider.otherwise( {
        controller: 'adminController',
    }); 
});

function adminController($scope, $http, $timeout, $filter) {
    $scope.init = init;
    function init() {
        $http.get('../sessions.json').
            success(function(data, status, headers, config) {
                $scope.sessionList = data.sessionList;
        });
    }

    $scope.formatSession = function(session) {
        return 'Session ' + session.num + ' - ' + session.dates;
    }

    $scope.getSessions = function(currentSessions) {
        return _.difference(_.each($scope.sessionList, function(s){return $scope.formatSession(s)), currentSessions);
    };

    $scope.getStatusMessages= function(currentStatusMessage) {
        if (!currentStatusMessage) {
            var currentStatusMessage = 'signup form received';
        }
        return _.difference($scope.statusMessages, currentStatusMessage);
    };

    $scope.statusMessages = [
        'signup form received',
        'signup confirmation sent',
        'lessons scheduled',
        'lesson confirmation sent',
        'payment received',
        'payment confirmation sent'
    ];

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
        var now = moment();
        var then = moment(Date.parse(birthday));
        console.log(then);
        if (!then || !then.isValid()) {
            return birthday;
        }
        var ms = now.diff(then, 'milliseconds', true);
        var years = Math.floor(moment.duration(ms).asYears());
        if (years < 0 || years > 50) {
            return birthday;
        }

        now = now.subtract('years', years);
        ms = now.diff(then, 'milliseconds', true);
        var months = Math.floor(moment.duration(ms).asMonths());
        if (years > 0) {
            return years + ' years, ' + months + ' months' + ' (' + birthday + ')';
        } else {
            return months + ' months' + ' (' + birthday + ')';
        }
    };

    $scope.saveCost = function(signupId, newCost) {
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var params = { 
            action: 'set_cost',
            cost: newCost,
            oid: signup._id.$oid,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    signup.cost = newCost;
                }
        });
        this.editingCost = null;
    };

    $scope.togglePaymentReceived = function(signupId) {
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var newState = !signup.payment_received;
        var params = { 
            action: 'set_received',
            payment_received: newState,
            oid: signup._id.$oid,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    signup.payment_received = newState;
                }
        });
    };

    $scope.deleteRecord = function(signupId) {
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var params = { 
            action: 'delete',
            oid: signup._id.$oid,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    var index = _.indexOf($scope.signups, signup);
                    $scope.signups.splice(index, 1);
                }
        });
    };

    $scope.saveStatus = function(signupId, newStatus) {
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var params = { 
            action: 'set_status',
            process_status: newStatus,
            oid: signup._id.$oid,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    signup.process_status = newStatus;
                }
        });
        this.editingStatus = null;
    };

    $scope.addSession = function(signupId, childIndex, session) {
        console.log(session);
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var params = { 
            action: 'add_session',
            oid: signup._id.$oid,
            childIndex: childIndex,
            session: session,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    signup.children[childIndex].sessions.push(session);
                    signup.savingSessionAlert = null;
                } else {
                    signup.savingSessionAlert = true;
                }
            }).
            error(function() {
                    signup.savingSessionAlert = true;
            });
        this.editing = null;
    };

    $scope.removeSession = function(signupId, childIndex, sessionIndex, session) {
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var params = { 
            action: 'remove_session',
            oid: signup._id.$oid,
            childIndex: childIndex,
            session: session,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    signup.children[childIndex].sessions.splice(sessionIndex, 1);
                    signup.savingSessionAlert = null;
                } else {
                    signup.savingSessionAlert = true;
                }
            }).
            error(function() {
                    signup.savingSessionAlert = true;
            });
        this.$parent.editing = null;
    };

    $scope.saveSession = function(signupId, childIndex, sessionIndex, session) {
        var signup = _.findWhere($scope.signups, {'_id': signupId});
        var params = { 
            action: 'save_session',
            oid: signup._id.$oid,
            childIndex: childIndex,
            sessionIndex: sessionIndex,
            session: session,
        };
        $http.get('admin-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    signup.children[childIndex].sessions[sessionIndex] = session;
                    signup.savingSessionAlert = null;
                } else {
                    signup.savingSessionAlert = true;
                }
            }).
            error(function() {
                    signup.savingSessionAlert = true;
            });
        this.$parent.editing = null;
    };

    $scope.saveNotes = function(signupData) {
        var index = _.indexOf($scope.signups, signupData);
        $scope.signups[index].savingNotes = true;
        var params = { 
            action: 'save_notes',
            oid: signupData._id.$oid,
            notes: signupData.notes,
        };
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
        }
        return matched ? matched.length : 0;
    };
}
