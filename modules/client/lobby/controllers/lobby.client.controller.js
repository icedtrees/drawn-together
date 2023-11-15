'use strict';
import angular from '../../../../node_modules/angular'
import * as GameSettings from '../../../shared/game/config/game.shared.game.config'

// Create the 'lobby' controller
angular.module('lobby').controller('LobbyController', ['$scope', '$location', '$state', 'Authentication', 'Socket',
  function ($scope, $location, $state, Authentication, Socket) {
    $scope.GameSettings = GameSettings;

    // If user is not signed in then redirect to signin page
    if (!Authentication.user) {
      $location.path('/authentication/signin');
    } else {
      $scope.username = Authentication.user.username;
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect(function () {
        Socket.emit('requestRooms');
      });
    } else {
      Socket.emit('requestRooms');
    }

    $scope.rooms = [];
    $scope.roomName = '';

    Socket.on('requestRooms', function (rooms) {
      $scope.rooms = rooms;
    });

    Socket.on('changeRoom', function (room) {
      for (var i = 0; i < $scope.rooms.length; i++) {
        if ($scope.rooms[i].name === room.name) {
          if (room.numPlayers > 0) {
            $scope.rooms[i] = room;
          } else {
            $scope.rooms.splice(i, 1);
          }
          return;
        }
      }
      if (room.numPlayers > 0) {
        $scope.rooms.push(room);
      }
    });

    $scope.joinRoom = function (roomName) {
      // Go to room view
      $state.go('game', {roomName: roomName});
    };
    $scope.createRoom = function (roomName) {
      if (roomName === '') {
        $scope.error = 'Room name cannot be empty';
      } else {
        Socket.emit('checkRoomName', roomName);
      }
    };
    Socket.on('validRoomName', function (roomName) {
      $state.go('game', {roomName: roomName});
    });
    Socket.on('invalidRoomName', function (error) {
      $scope.error = error;
    });
  }
]);
