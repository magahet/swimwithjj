"use strict";

var stripePublishableKey = 'pk_test_gvLZ2MpYpGpdOrhIyVewmhGT';

angular.module('swjjApp', ['ngSanitize'])
    .controller('mainController', ['$scope', '$http',
function ($scope, $http) {
    var now = moment();
    var then = moment([2013, 2, 30]); // March 29th, 2013
    var ms = then.diff(now, 'milliseconds', true);
    $scope.daysTillSignup = Math.floor(moment.duration(ms).asDays());
    
    if ($scope.daysTillSignup && $scope.daysTillSignup >= 1) {
        $scope.signupsActive = false;
    } else {
        $scope.signupsActive = true;
    }

    $scope.lessonInfoActive = true;
    $scope.maxChildren = 4;

    $scope.childCount = 1;
    $scope.selectedSession = Array($scope.maxChildren);

    $scope.maxChildrenRange = function() {
        return _.range($scope.maxChildren);
    };

    $scope.childRange = function() {
        return _.range($scope.childCount);
    };

    $scope.childLabel = function(childIndex) {
        var label = "child's information";
        var prefix = {
            0: 'first ',
            1: 'second ',
            2: 'third ',
            3: 'fourth ',
            4: 'fifth ',
            5: 'sixth '
        }

        if ($scope.childCount == 1) {
            return label;
        } else {
            return prefix[childIndex] + label;
        }

    };

    $scope.clearSessions = function() {
        var sessions = [];
        _.each($scope.maxChildrenRange(), function(i) {
            sessions.push([]);
        });
        $scope.sessions = sessions;
    };

    $scope.clearSessions();

    $scope.changeChildCount = function(num) {
        $scope.childCount = num;
    };

    $scope.sessionDescriptions = {
        culverCity: [
            {
                num: 1,
                dates: 'May 17th to June 2nd',
                days: 'Fri, Sat, Sun',
                times: 'between 3pm and 5pm',
                price: 189},
            {
                num: 2,
                dates: 'June 14th to June 30th',
                days: 'Fri, Sat, Sun',
                times: 'between 3pm and 5pm',
                price: 189},
            {
                num: 3,
                dates: 'July 16th to August 1st',
                days: 'Tue, Wed, Thu',
                times: 'between 10am and 5pm',
                price: 189},
            {
                num: 4,
                dates: 'August 6th to August 22nd',
                days: 'Tue, Wed, Thu',
                times: 'between 10am and 5pm',
                price: 189}
        ],
        laCrescenta: [
            {   
                num: 1,
                dates: 'June 5th to June 20th',
                days: '<strong>1st week:</strong> Wed, Thu, Fri <br /><strong>2nd and 3rd week:</strong> Tue, Wed, Thu',
                times: 'between 9:30am and 4:30pm',
                price: 189
            },
            {   
                num: 2,
                dates: 'June 25th to July 11th',
                days: '<strong>1st and 3rd week:</strong> Tue, Wed, Thu <br /><strong>2nd week:</strong> Mon, Tue, Wed',
                times: 'between 9:30am and 4:30pm',
                price: 189
            },
            {
                num: 3,
                dates: 'July 20th to August 4th',
                days: 'Sat, Sun',
                times: 'between 2pm and 5pm',
                price: 126
            }
        ]
    };

    $scope.availableSessions = {
        laCrescenta: [
            {name: 'Session 1 - June 5th to June 20th - Morning', price: 189},
            {name: 'Session 1 - June 5th to June 20th - Afternoon', price: 189},
            {name: 'Session 2 - June 25th to July 11th - Morning', price: 189},
            {name: 'Session 2 - June 25th to July 11th - Afternoon', price: 189},
            {name: 'Session 3 - July 20th to August 4th - Afternoon', price: 126}
        ],
        culverCity: [
            {name: 'Session 1 - May 17th to June 2nd - Afternoon', price: 189},
            {name: 'Session 2 - June 14th to June 30th - Afternoon', price: 189},
            {name: 'Session 3 - July 16th to August 1th - Morning', price: 189},
            {name: 'Session 3 - July 16th to August 1th - Afternoon', price: 189},
            {name: 'Session 4 - August 6th to August 22nd - Morning', price: 189},
            {name: 'Session 4 - August 6th to August 22nd - Afternoon', price: 189}
        ]
    };

    $scope.childsAvailableSessions = function(childIndex) {
        return _.difference($scope.availableSessions[$scope.selectedLocation], $scope.sessions[childIndex]);
    };

    $scope.add = function(childIndex) {
        $scope.sessions[childIndex].push($scope.selectedSession[childIndex]);
        $scope.selectedSession[childIndex] = {name: '-- Add Session --'};
    };

    $scope.remove = function(childIndex, index) {
        $scope.sessions[childIndex].splice(index, 1);
    };

    $scope.sessionTotal = function() {
        var count = 0;
        angular.forEach($scope.sessions.slice(0, $scope.childCount), function(value, key){
            count += value.length;
        });
        return count;
    };

    $scope.cashTotal = function() {
        var sum = 0;
        _.each($scope.sessions.slice(0, $scope.childCount), function(sessions) {
            sum += _.reduce(_.pluck(sessions, 'price'), function(m, n) {return m + n;}, 0);
        });
        return sum
    };

    $scope.creditTotal = function() {
        return ($scope.cashTotal() * $scope.creditRate) + $scope.chargeFee
    };

    $scope.paymentTotal = function() {
        if ($scope.customerId) {
            return Math.floor($scope.creditTotal() * 100);
        } else {
            return Math.floor($scope.cashTotal() * 100);
        }
    };

    $scope.price = 189;
    $scope.creditRate = 1.029;
    $scope.chargeFee = 0.3;
    $scope.customerId = null;
    $scope.cardButtonMessage = 'Pay with Card';

    $scope.payWithCard = function() {
        $scope.paymentError = null;
        StripeCheckout.open({
            key:         stripePublishableKey,
            address:     true,
            amount:      Math.floor($scope.creditTotal() * 100),
            name:        'SwimWithJJ',
            description: $scope.sessionTotal() + ' sessions of swim lessons',
            panelLabel:  'Checkout',
            token:       function(res) {
                            $scope.$apply(function () {
                                $scope.cardButtonMessage = 'saving payment information';
                                var params = { 
                                    id: 'save-card',
                                    'stripe-token': res.id
                                }
                                $http.get('form-handler.cgi', {params: params}).
                                    success(function(data, status, headers, config) {
                                        if (data.response && data.response.customer_id) {
                                            $scope.cardButtonMessage = 'payment complete';
                                            $scope.customerId = data.response.customer_id;
                                        } else if (data.response && data.response.error) {
                                            $scope.cardButtonMessage = 'Pay with Card';
                                            $scope.paymentError = data.response.error;
                                        }
                                    }).
                                    error(function(data, status, headers, config) {
                                        $scope.cardButtonMessage = 'Pay with Card';
                                });
                            });
                         }
        });
    };
}]);



$(document).ready(function() {

    $('button').button();

    var $spy = $('body').scrollspy({target: '#topnav', offset: Math.floor($(window).height() / 2)});

    $('.pagenav a').bind('click',function(event){
        event.preventDefault();
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - $('#topnav').height()
        }, 1000);
    });

    $('#location-tabs > button').click(function(){
        //$('#location-alert').alert('close');
        if (!$(this).hasClass('active')) {
            var tabTarget = $(this).attr('data-target');
            $('.tab-pane').fadeOut('slow', function() {
                $('#' + tabTarget).fadeIn('slow');
            });
        }
    });

    $('form').submit(function(e) {
        e.preventDefault();
        var submitButton = $(this).find('button[type="submit"]')
        submitButton.button();
        submitButton.button('loading');
        var params = $(this).serializeArray();
        submitForm(params, $(this), submitButton);
    });

    $('#formModal').modal({
        show: false
    });

});

function submitForm(params, form, submitButton) {
    $.ajax({
        url: 'form-handler.cgi',
        type: 'post',
        data: params,
        dataType: 'json',
        timeout: 5000,
        success: function(json) {
            if (!json || !json.params || !json.params.id) {
                showErrorMessage();
            } else if (json.params.id == 'signup-notification') {
                showSuccessMessage('Thank You', '<strong>Your address has been saved.</strong> You will receive an email as soon as sign-ups are available');
                form.children('input:not([name="id"])').val('');
            } else if (json.params.id == 'message') {
                showSuccessMessage('Thank You', '<strong>Your message has been sent.</strong> JJ will respond to your inquiry as soon as possible.');
                form.find('input:not([name="id"]),textarea').val('');
            } else if (json.params.id == 'signup') {
                console.log(json);
                if (json.response) {
                    showSuccessMessage('Thank You', '<div class="pad10"><strong>Your signup form has been submitted successfully.</strong></div> <div class="pad10">JJ will contact you with your lesson times within the next <strong class="blue">3 weeks</strong>.</div> <div class="pad10">If you have paid by credit card, you will be charged <strong class="blue">after you receive your lesson times</strong>. Otherwise your payment will be <strong class="blue">due within 5 days</strong> of receiving your lesson times notification.</div>');
                    $('div#signup-complete-alert').show();
                } else {
                    showErrorMessage();
                }
                resetSignupForm(form);
            } else {
                showErrorMessage();
            }
            submitButton.button('reset');
        },
        error: function(xhr, textStatus, error) {
            showErrorMessage();
            submitButton.button('reset');
        }
    });
}

function resetSignupForm(form) {
    form[0].reset();
    var scope = angular.element(form).scope();
    scope.$apply(function() {
        scope.customerId = null;
        scope.cardButtonMessage = 'Pay with Card';
        scope.changeChildCount(1);
        scope.clearSessions();
        scope.paymentTotal();
    });
}

function showSuccessMessage(title, message) {
    $('#formModal h3').html(title);
    $('#formModal p').html(message);
    $('#formModal').modal('show');
}

function showErrorMessage() {
    $('#formModal h3').html('Our Apologies');
    $('#formModal p').html('<strong>We seem to be having a problem.</strong> A message has been sent letting us know something is broken. Please be patient while we work to fix the issue.');
    $('#formModal').modal('show');
}
