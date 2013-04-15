"use strict";

var stripePublishableKey = 'pk_live_3d6XsGmNpMEpRKWCDTDaxaAt';

var payByCardApp = angular.module('payByCardApp', [], function($locationProvider){
    $locationProvider.html5Mode(true);
});

function mainController($scope, $http, $location) {
    var id = $location.search().id;
    if (id) {
        var params = { 
            id: 'get-payment-info',
            oid: id,
        };

        $http.get('form-handler.cgi', {params: params}).
            success(function(data) {
                if (data.response) {
                    $scope.paymentInfo = data.response;
                } else {
                    $scope.paymentInfo = {error: true};
                }
            }).
            error(function(data) {
                $scope.paymentInfo = {error: true};
            });
    } else {
        $scope.paymentInfo = {error: true};
    }

    $scope.creditRate = 1.029;
    $scope.chargeFee = 0.3;
    $scope.creditTotal = function() {
        if ($scope.paymentInfo) {
            return ($scope.paymentInfo.cost * $scope.creditRate / 100) + $scope.chargeFee;
        }
    };
    $scope.customerId = null;
    $scope.cardButtonMessage = 'Pay with Card';

    $scope.payWithCard = function() {
        $scope.paymentError = null;
        StripeCheckout.open({
            key:         stripePublishableKey,
            address:     true,
            amount:      Math.floor($scope.creditTotal() * 100),
            name:        'SwimWithJJ',
            description: $scope.paymentInfo.sessionCount + ' sessions of swim lessons',
            panelLabel:  'Checkout',
            token:       function(res) {
                            $scope.$apply(function () {
                                $scope.savingPaymentInfo = true;
                                var params = { 
                                    id: 'add-card',
                                    oid: id,
                                    'stripe-token': res.id
                                }
                                $http.get('form-handler.cgi', {params: params}).
                                    success(function(data) {
                                        if (data.response) {
                                            if (data.response.error) {
                                                $scope.paymentError = data.response.error;
                                            } else {
                                                $scope.cardAdded = true;
                                            }
                                        } else {
                                            $scope.paymentError = 'Could not save payment information';
                                        }
                                        $scope.savingPaymentInfo = false;
                                    }).
                                    error(function() {
                                        $scope.paymentError = 'Could not save payment information';
                                        $scope.savingPaymentInfo = false;
                                    });
                            });
                         }
        });
    };
}

