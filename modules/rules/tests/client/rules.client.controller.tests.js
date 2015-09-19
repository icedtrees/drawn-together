'use strict';

/**
 * Rules client controller tests
 */
(function () {
  describe('RulesController', function () {
    //Initialize global variables
    var scope,
      Socket,
      RulesController,
      $timeout,
      $location,
      Authentication;

    // Load the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    beforeEach(inject(function ($controller, $rootScope, _Socket_, _Authentication_, _$timeout_, _$location_) {
      scope = $rootScope.$new();
      Socket = _Socket_;
      $timeout = _$timeout_;
      $location = _$location_;
      Authentication = _Authentication_;
    }));

    describe('when user logged out', function () {
      beforeEach(inject(function ($controller, $rootScope, _Socket_, _Authentication_, _$timeout_, _$location_) {
        Authentication.user = undefined;
        spyOn($location, 'path');
        RulesController = $controller('RulesController', {
          $scope: scope,
        });
      }));

      it('should redirect logged out user to /', function () {
        expect($location.path).toHaveBeenCalledWith('/');
      });
    });
  });
}());
