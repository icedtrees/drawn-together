'use strict';
import angular from '../../../../../node_modules/angular'
import {userAPIService} from "../../services/users.client.service";
import {authenticationService} from "../../services/authentication.client.service";
import {usersModule} from "../../users.client.module";
import {ReactGlobalState} from "../../../core/app/react-global-state";

export const editProfileController ='EditProfileController'
angular.module(usersModule).controller(editProfileController, ['$scope', '$http', '$location', userAPIService, authenticationService,
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        ReactGlobalState.setCurrentUser(response)
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);
