'use strict';
import angular from '../../../../node_modules/angular'
import ngResource from '../../../../node_modules/angular-resource'
import ngMessages from '../../../../node_modules/angular-messages'
import '../../../../node_modules/angular-bootstrap'  // ui.bootstrap
import '../../../../node_modules/angular-ui-router'  // ui.router

// Init the application configuration module for AngularJS application
export var ApplicationConfiguration = (function () {
  // Init module configuration options
  var applicationModuleName = 'mean';
  var applicationModuleVendorDependencies = [ngResource, ngMessages, 'ui.bootstrap', 'ui.router'];

  // Add a new vertical module
  var registerModule = function (moduleName, dependencies) {
    // If we register modules multiple times, Angular destroys the old module. Make sure we only do it once
    if (window.angularModules == null) {
      window.angularModules = {}
    }
    if (window.angularModules[moduleName] == null) {
      // Create angular module
      angular.module(moduleName, dependencies || []);

      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);

      angularModules[moduleName] = true
    }

    return moduleName
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
