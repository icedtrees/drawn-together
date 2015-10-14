'use strict';

// Create the 'game' controller
angular.module('game').controller('GameController', ['$scope', '$location', '$document', '$rootScope', 'Authentication', 'Socket',
  'CanvasSettings', 'ChatSettings', 'GameSettings', 'GameLogic', 'Utils',
  function ($scope, $location, $document, $rootScope, Authentication, Socket,
            CanvasSettings, ChatSettings, GameSettings, GameLogic, Utils) {
    // Settings objects
    $scope.CanvasSettings = CanvasSettings;
    $scope.ChatSettings = ChatSettings;
    $scope.GameSettings = GameSettings;

    // Create a messages array to store chat messages
    $scope.messages = [];

    // Default canvas settings
    $scope.canvas = null;
    $scope.penColour = CanvasSettings.DEFAULT_PEN_COLOUR;
    $scope.mouseMode = 'pen';
    $scope.drawWidth = {
      'pen': CanvasSettings.DEFAULT_PEN_WIDTH,
      'eraser': CanvasSettings.DEFAULT_ERASER_WIDTH
    };

    $scope.drawTools = [
      [{type: 'pen', glyph: 'pencil'}, {type: 'eraser', glyph: 'eraser'}]
      //[{type: 'line', glyph: 'arrows-h'}, {type: 'fill', glyph: 'paint-brush'}],
      //[{type: 'circle', glyph: 'circle-thin'}, {type: 'rect', glyph: 'square-o'}]
    ];

    $scope.penColourCustom = '#000000';
    $scope.selectCustomColour = function (colour) {
      if (colour !== undefined) {
        $scope.penColourCustom = colour;
        $scope.penColour = colour;
      }
      return $scope.penColourCustom;
    };
    $scope.paletteColours = [
      // [{title: 'red', value: '#FF0000'}, {title: 'orange', value: 'orange'}, {title: 'yellow', value: 'yellow'}],
      // [{title: 'green', value: '#00FF00'}, {title: 'blue', value: '#0000FF'}, {title: 'indigo', value: 'indigo'}],
      [{title: 'black', value: 'black'}, {title: 'grey', value: 'grey'}, {title: 'white', value: 'white'}],
      [{title: 'dark brown', value: 'brown'}, {title: 'light brown', value: 'sandybrown'}, {title: 'pink', value: 'pink'}],
      [{title: 'red', value: 'red'}, {title: 'orange', value: 'orange'}, {title: 'yellow', value: 'yellow'}],
      [{title: 'dark green', value: 'darkgreen'}, {title: 'green', value: 'green'}, {title: 'light green', value: 'lightgreen'}],
      [{title: 'dark blue', value: 'darkblue'}, {title: 'blue', value: 'blue'}, {title: 'light blue', value: 'lightblue'}]
    ];

    $scope.Game = new GameLogic.Game();
    $scope.Utils = Utils;

    $scope.messageText = '';

    // If user is not signed in then redirect to signin page
    if (!Authentication.user) {
      $location.path('/authentication/signin');
    } else {
      $scope.username = Authentication.user.username;
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect(function () {
        Socket.emit('requestState');
      });
    } else {
      // We are already connected but in a new window - request to be brought up to scratch
      Socket.emit('requestState');
    }

    /*
     * Helper function to set the cursor style when hovering over the canvas
     * based on if the user is a drawer or not
     */
    function setCursorStyle () {
      if ($scope.Game.isDrawer($scope.username)) {
        $scope.canvas[0].style.cursor = 'none';
      } else {
        $scope.canvas[0].style.cursor = 'not-allowed';
      }
    }

    /*
     * Set the game state based on what the server tells us it currently is
     */
    Socket.on('gameState', function (state) {
      angular.extend($scope.Game, state);
      setCursorStyle();
    });

    /*
     * A round has finished
     */
    Socket.on('advanceRound', function () {
      $scope.Game.advanceRound();
      setCursorStyle();
    });

    /*
     * The game has finished and is ready to be restarted
     */
    Socket.on('restartGame', function () {
      $scope.messages = [];
      $scope.canvas.draw({type: 'clear'});
      $scope.Game.restartGame();
      setCursorStyle();
    });

    /*
     * Update score when someone guesses correctly
     */
    Socket.on('markCorrectGuess', function (username) {
      $scope.Game.markCorrectGuess(username);
    });

    /*
     * Another user has connected or disconnected.
     */
    Socket.on('userConnect', function (user) {
      $scope.Game.addUser(user.username, user.image);
    });
    Socket.on('userDisconnect', function (user) {
      $scope.Game.removeUser(user);
    });

    /* Add an event listener to the 'gameMessage' event
     *
     * message =
     * {
     *   class: 'message', 'status', 'correct-guess', 'close-guess'
     *   created: Date.now()
     *   profileImageURL: some valid url
     *   username: user who posted the message
     *   debug: information to be printed to client console
     * }
     */
    Socket.on('gameMessage', function (message) {
      // TODO remove in future release (including the extra debug field for messages)
      // Debugging information for close guesses.
      if (message.debug) {
        console.log(message.debug);
      }

      if (Array.isArray(message)) {
        message.forEach(function (m) {
          $scope.messages.push(m);
        });
      } else {
        $scope.messages.push(message);
      }

      // delete old messages if MAX_MESSAGES is exceeded
      while ($scope.messages.length > ChatSettings.MAX_MESSAGES) {
        $scope.messages.shift();
      }
    });

    /*
     * Can be a single message or an array of messages
     *
     * var message =
     * {
     *   x1: last X position of cursor on the canvas
     *   y1: last Y position
     *   x2: current X position
     *   y2: current Y position
     * };
     */
    Socket.on('canvasMessage', function (message) {
      if (Array.isArray(message)) {
        message.forEach(function (m) {
          $scope.canvas.draw(m);
        });
      } else {
        $scope.canvas.draw(message);
      }
    });

    Socket.on('topic', function (topic) {
      $scope.topic = topic;
    });

    // Create a controller method for sending messages
    $scope.sendMessage = function () {
      // Disallow empty messages
      if (/^\s*$/.test($scope.messageText)) {
        $scope.messageText = '';
        return;
      }

      // Create a new message object
      var message = {
        text: $scope.messageText
      };

      // Emit a 'gameMessage' message event
      Socket.emit('gameMessage', message);

      // Clear the message text
      $scope.messageText = '';
    };

    // Send a 'finished drawing' message to the server. Must be the current drawer
    $scope.finishDrawing = function () {
      if ($scope.Game.isDrawer($scope.username)) {
        Socket.emit('finishDrawing');
      }
    };

    $scope.clearDrawing = function () {
      if ($scope.Game.isDrawer($scope.username)) {
        var message = {
          type: 'clear'
        };
        $scope.canvas.draw(message);
        Socket.emit('canvasMessage', message);
      }
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('gameMessage');
      Socket.removeListener('canvasMessage');
      Socket.removeListener('userUpdate');
      Socket.removeListener('updateDrawHistory');
    });

    // Prevent backspace from leaving game page
    $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      var signInUrl = 'http://' + location.host + '/authentication/signin';
      var gameUrl = 'http://' + location.host + '/';
      // If the old URL is the game or sign-in URL, and the event is triggered by the backspace key
      if ((oldUrl === gameUrl || oldUrl === signInUrl) && event.keyCode === 8) {
        event.preventDefault(); // This prevents the navigation from happening
      }
    });
  }
]);
