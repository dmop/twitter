/*jshint unused: vars */
require.config({
    baseUrl: "app/",
    paths: {

        angular: '../bower_components/angular/angular.min',
        ngAria: '../bower_components/angular-aria/angular-aria.min',
        ngAnimate: '../bower_components/angular-animate/angular-animate.min',
        ngSanitize: '../bower_components/angular-sanitize/angular-sanitize.min',
        ngMaterial: '../bower_components/angular-material/angular-material.min',
        vAccordion: '../bower_components/v-accordion/dist/v-accordion.min'

    },
    shim: {
        angular: {
            'exports': 'angular'
        },
        ngAria: {
            exports: "ngAria",
            deps: ["angular"]
        },
        ngAnimate: {
            exports: "ngAnimate",
            deps: ["angular"]
        },
        ngSanitize: {
            exports: "ngSanitize",
            deps: ["angular"]
        },
        ngMaterial: {
            exports: "ngMaterial",
            deps: ["angular", "ngAnimate", "ngAria", "ngSanitize"]
        },
        vAccordion: {
            exports: "vAccordion",
            deps: ["angular"]
        }
    },
    priority: ['angular']
});

window.name = 'NG_DEFER_BOOTSTRAP!';

require(
    ['angular', 'ngAria', 'ngAnimate', 'ngSanitize', 'ngMaterial', 'vAccordion',
        'app'
    ],
    function(angular, ngAria, ngAnimate, ngSanitize, ngMaterial, vAccordion, gwApp) {

        'use strict';

        var $html = angular.element(document.getElementsByTagName('html')[0]);

        angular.element().ready(function() {
            angular.bootstrap(document, ['neApp']);
        });

    }
);
