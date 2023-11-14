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
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
