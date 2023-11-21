'use strict';
import angular from '../../../../node_modules/angular'
import {usersModule} from "../users.client.module";
import {authenticationService} from "../services/authentication.client.service";
import {ReactGlobalState} from "../../core/app/react-global-state";

export const passwordController = 'PasswordController'
angular.module(usersModule).controller(passwordController, ['$scope', '$stateParams', '$http', '$location', authenticationService,
  function ($scope, $stateParams, $http, $location, Authentication) {
    $scope.authentication = Authentication;

    //If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    // Submit forgotten password account id
    $scope.askForPasswordReset = function (isValid) {
      $scope.success = $scope.error = null;
      $scope.submitted = true;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'forgotPasswordForm');
        $scope.submitted = false;
        return false;
      }

      $http.post('/api/auth/forgot', $scope.credentials).success(function (response) {
        // Show user success message and clear form
        $scope.credentials = null;
        $scope.submitted = false;
        $scope.success = response.message;

      }).error(function (response) {
        // Show user error message and clear form
        $scope.credentials = null;
        $scope.submitted = false;
        $scope.error = response.message;
      });
    };

    // Change user password
    $scope.resetUserPassword = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'resetPasswordForm');

        return false;
      }

      $http.post('/api/auth/reset/' + $stateParams.token, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.passwordDetails = null;

        // Attach user profile
        Authentication.user = response;
        ReactGlobalState.setCurrentUser(response)

        // And redirect to the index page
        $location.path('/password/reset/success');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);
