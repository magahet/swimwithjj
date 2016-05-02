(function() {
    'use strict';

    angular
        .module('swimwithjj')
        .value('duScrollOffset', 30)
        .controller('SwimWithJJ', SwimWithJJ);

    SwimWithJJ.$inject = ['$http', '$document'];


    function SwimWithJJ($http, $document) {
        var vm = this;

        vm.selectedSession = [];
        vm.config = {
            maxChildren: 0
        };
        vm.sessionInfo = {
            available: {},
            desc: {}
        };

        vm.signup = {
            place: 'culverCity',
            name: '',
            phone: '',
            email: '',
            children: [{name: '', birthday: '', sessions: []}],
            request: '',
            customerId: null,
            cost: 0
        };

        vm.clearSessions = clearSessions;
        vm.changeChildCount = changeChildCount;
        
        function clearSessions() {
            for (var i = 0; i < vm.signup.children.length; i++) {
                vm.signup.children[i].sessions = [];
            }
        }

        function changeChildCount(num) {
            var currentNum = vm.signup.children.length;
            if (num > currentNum) {
                for (var i = num - currentNum; i > 0 ; i--) {
                    vm.signup.children.push({name: '', birthday: '', sessions: []});
                }
            } else if (num < currentNum) {
                for (i = currentNum - num; i > 0 ; i--) {
                    vm.signup.children.pop();
                }
            }
            vm.childCount = num;
        };

        vm.stripePublishableKey = '';

        $http.get('conf/config.json').success(function(json) {
            vm.config = json;
            vm.selectedSession = Array(json.maxChildren);
        });

        $http.get('conf/sessions.json').success(function(json) {
            vm.sessionInfo = json.sessionInfo;
        });

        //$http.get('conf/stripe.json').success(function(json) {
            //vm.stripePublishableKey = json.stripePublishableKey;
        //});

        vm.childCount = 1;

        vm.maxChildrenRange = function() {
            return _.range(vm.config.maxChildren);
        };

        vm.childRange = function() {
            return _.range(vm.childCount);
        };

        vm.childLabel = function(childIndex) {
            var label = "child's information";
            var prefix = {
                0: 'first ',
                1: 'second ',
                2: 'third ',
                3: 'fourth ',
                4: 'fifth ',
                5: 'sixth '
            }

            if (vm.childCount == 1) {
                return label;
            } else {
                return prefix[childIndex] + label;
            }

        };



        vm.childsAvailableSessions = function(childIndex) {
            return _.difference(vm.sessionInfo.available[vm.signup.place], vm.signup.children[childIndex].sessions);
        };

        vm.addSession = function(childIndex) {
            vm.signup.children[childIndex].sessions.push(vm.selectedSession[childIndex]);
            vm.selectedSession[childIndex] = {name: '-- Add Session --'};
        };

        vm.removeSession = function(childIndex, index) {
            vm.signup.children[childIndex].sessions.splice(index, 1);
        };

        vm.sessionTotal = function() {
            var count = 0;
            angular.forEach(vm.signup.children, function(child){
                count += child.sessions.length;
            });
            return count;
        };

        vm.cashTotal = function() {
            var sum = 0;
            _.each(vm.signup.children, function(child) {
                sum += _.reduce(_.pluck(child.sessions, 'price'), function(m, n) {return m + n;}, 0);
            });
            return sum
        };

        vm.creditTotal = function() {
            return (vm.cashTotal() * vm.creditRate) + vm.chargeFee
        };

        vm.paymentTotal = function() {
            var total = 0.0;
            if (vm.signup.customerId) {
                total = Math.floor(vm.creditTotal() * 100);
            } else {
                total = Math.floor(vm.cashTotal() * 100);
            }
            vm.signup.cost = total;
            return total;
        };

        vm.price = 189;
        vm.creditRate = 1.029;
        vm.chargeFee = 0.3;
        vm.cardButtonMessage = 'Pay with Card';

        vm.payWithCard = function() {
            vm.paymentError = null;
            StripeCheckout.open({
                key:         vm.stripePublishableKey,
                address:     true,
                amount:      Math.floor(vm.creditTotal() * 100),
                name:        'SwimWithJJ',
                description: vm.sessionTotal() + ' sessions of swim lessons',
                panelLabel:  'Checkout',
                token:       function(res) {
                                vm.$apply(function () {
                                    vm.cardButtonMessage = 'saving payment information';
                                    var params = { 
                                        id: 'save-card',
                                        'stripe-token': res.id
                                    }
                                    $http.get('form-handler.cgi', {params: params}).
                                        success(function(data, status, headers, config) {
                                            if (data.response && data.response.customer_id) {
                                                vm.cardButtonMessage = 'payment complete';
                                                vm.signup.customerId = data.response.customer_id;
                                            } else if (data.response && data.response.error) {
                                                vm.cardButtonMessage = 'Pay with Card';
                                                vm.paymentError = data.response.error;
                                            }
                                        }).
                                        error(function(data, status, headers, config) {
                                            vm.cardButtonMessage = 'Pay with Card';
                                    });
                                });
                             }
            });
        };

        vm.processSignup = function() {
            $http.post('form-handler2.cgi', vm.signup)
                .success(function(data) {
                    if (!data.success) {
                        vm.errorName = data.errors.name;
                        vm.errorSuperhero = data.errors.superheroAlias;
                    } else {
                        vm.message = data.message;
                    }
                }
            );
        };

    }

})();
