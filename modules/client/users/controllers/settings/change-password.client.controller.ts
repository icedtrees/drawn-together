'use strict';
import angular from '../../../../../node_modules/angular'
import {usersModule} from "../../users.client.module";
import {authenticationService} from "../../services/authentication.client.service";

export const changePasswordController = 'ChangePasswordController'
angular.module(usersModule).controller(changePasswordController, ['$scope', '$http', authenticationService,
  function ($scope, $http, Authentication) {
    $scope.user = Authentication.user;

    // Change user password
    $scope.changeUserPassword = function (isValid) {
      $scope.success = $scope.removed = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'passwordForm');

        return false;
      }

      $http.post('/api/users/password', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };

    // Remove user password - set to empty string
    $scope.removeUserPassword = function () {
      $scope.success = $scope.removed = $scope.error = null;

      $http.post('/api/users/removepassword', $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.$broadcast('show-errors-reset', 'passwordForm');
        $scope.removed = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);
