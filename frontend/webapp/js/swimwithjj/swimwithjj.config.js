(function() {
    "use strict";

    angular
        .module('swimwithjj')
        .config(swimwithjjConfig);

    function swimwithjjConfig($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/home");
        $stateProvider
            .state('home', {
                url: "/home",
                templateUrl: "partials/home.html"
            })
            .state('about', {
                url: "/about",
                templateUrl: "partials/about.html"
            })
            .state('lesson-info', {
                url: "/lesson-info",
                templateUrl: "partials/lesson-info.html"
            })
            .state('faq', {
                url: "/faq",
                templateUrl: "partials/faq.html"
            })
            .state('testimonials', {
                url: "/testimonials",
                templateUrl: "partials/testimonials.html"
            })
            .state('sign-up', {
                url: "/sign-up",
                templateUrl: "partials/sign-up.html"
            })
            .state('contact', {
                url: "/contact",
                templateUrl: "partials/contact.html"
            });
    }
})();
