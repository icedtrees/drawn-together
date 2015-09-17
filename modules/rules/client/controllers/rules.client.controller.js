'use strict';

// Create the 'rules' controller
angular.module('rules').controller('RulesController', ['$scope', '$location', 'Authentication', 'Socket',
  function ($scope, $location, Authentication, Socket) {
    // If user is not signed in then redirect back home
    if (!Authentication.user) {
      $location.path('/');
    }
  }
]);
