'use strict';
import angular from '../../../../node_modules/angular'
import ngResource from '../../../../node_modules/angular-resource'
import ngMessages from '../../../../node_modules/angular-messages'
import '../../../../node_modules/angular-bootstrap'  // ui.bootstrap
import '../../../../node_modules/angular-ui-router'  // ui.router
import {startReact} from "./reactapp";

// Init module configuration options
const applicationModuleName = 'mean';
const applicationModuleVendorDependencies = [ngResource, ngMessages, 'ui.bootstrap', 'ui.router'];

const startAngularApp = () => {
  angular.module(applicationModuleName, applicationModuleVendorDependencies);

  // Setting HTML5 Location Mode
  angular.module(applicationModuleName).config(['$locationProvider', '$httpProvider',
    function ($locationProvider, $httpProvider) {
      $locationProvider.html5Mode(true).hashPrefix('!');

      $httpProvider.interceptors.push('authInterceptor');
    }
  ]);

  angular.module(applicationModuleName).run(function ($rootScope, $state, Authentication) {

    // Check authentication before changing state
    $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
      if (toState.data && toState.data.roles && toState.data.roles.length > 0) {
        var allowed = false;
        if (Authentication.user !== undefined) {
          toState.data.roles.forEach(function (role) {
            if (Authentication.user.roles !== undefined && Authentication.user.roles.indexOf(role) !== -1
            ) {
              allowed = true;
              return true;
            }
          });
        }

        if (!allowed) {
          e.preventDefault();
          if (Authentication.user !== undefined && typeof Authentication.user === 'object') {
            $state.go('forbidden');
          } else {
            $state.go('authentication.signin');
          }
        }
      }
    });

    // Record previous state
    $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState, fromParams) {
      if (!fromState.data || !fromState.data.ignoreState) {
        $state.previous = {
          state: fromState,
          params: fromParams,
          href: $state.href(fromState, fromParams)
        };
      }
    });
  });

//Then define the init function for starting up the application
  angular.element(document).ready(function () {
    //Fixing facebook bug with redirect
    if (window.location.hash && window.location.hash === '#_=_') {
      if (window.history && history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
      } else {
        // Prevent scrolling by storing the page's current scroll offset
        var scroll = {
          top: document.body.scrollTop,
          left: document.body.scrollLeft
        };
        window.location.hash = '';
        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scroll.top;
        document.body.scrollLeft = scroll.left;
      }
    }

    //Then init the app
    angular.bootstrap(document, [applicationModuleName]);
  });
}

const registerModule = function (moduleName, dependencies) {
  // If we register modules multiple times, Angular destroys the old module. Make sure we only do it once
  if (window.angularModules == null) {
    startAngularApp()
    startReact()
    window.angularModules = {}
  }
  if (window.angularModules[moduleName] == null) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);

    window.angularModules[moduleName] = true
  }

  return moduleName
};

export const ApplicationConfiguration = {
  registerModule: registerModule
};