'use strict';

// Create the 'game' controller
angular.module('game').controller('GameController', ['$scope', '$location', '$document', '$rootScope', '$state',
  'Authentication', 'Socket', 'CanvasSettings', 'ChatSettings', 'GameSettings', 'GameLogic', 'Utils',
  function ($scope, $location, $document, $rootScope, $state, Authentication, Socket,
            CanvasSettings, ChatSettings, GameSettings, GameLogic, Utils) {
    // Settings objects
    $scope.CanvasSettings = CanvasSettings;
    $scope.ChatSettings = ChatSettings;
    $scope.GameSettings = GameSettings;

    // Pregame settings for host to change
    $scope.chosenSettings = {
      numRounds : GameSettings.numRounds.default,
      roundTime : GameSettings.roundTime.default,
      timeToEnd : GameSettings.timeToEnd.default
    };

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
      [{title: 'red', value: 'red'}, {title: 'orange', value: 'orange'}, {title: 'yellow', value: '#FFF200'}],
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
     * Set the game state based on what the server tells us it currently is
     */
    Socket.on('gameState', function (state) {
      angular.extend($scope.Game, state);
    });

    /*
     * A round has finished
     */
    Socket.on('advanceRound', function () {
      $scope.Game.advanceRound();
    });

    /*
     * The game has finished and is ready to be restarted
     */
    Socket.on('resetGame', function () {
      $scope.messages = [];
      $scope.canvas.draw({type: 'clear'});
      $scope.Game.resetGame();
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

    // Server tells client the game has started with the given settings
    Socket.on('startGame', function(settings) {
      angular.extend($scope.Game, settings);
      $scope.Game.startGame();
    });

    // Server tells client a setting has been updated
    Socket.on('updateSetting', function(change) {
      $scope.chosenSettings[change.setting] = change.option;
      $scope.Game[change.setting] = change.option;
    });

    // Game host tells server to start game with chosen settings
    $scope.startGame = function () {
      Socket.emit('startGame');
    };

    // Game host updates a setting
    $scope.changeSetting = function (setting, option) {
      if (!$scope.Game.started && $scope.username === $scope.Game.getHost()) {
        // Send to server so all other players can update this setting
        Socket.emit('changeSetting', {setting : setting, option : option});
      }
    };

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

    // On window resize, re-calculate optimal sizes for columns and redraw canvas
    function resizeColumns () {
      var leftColumn = document.getElementById('left-column');
      var leftColumnStyle = window.getComputedStyle(leftColumn, null);
      var middleColumn = document.getElementById('middle-column');
      var middleColumnStyle = window.getComputedStyle(middleColumn, null);
      var rightColumn = document.getElementById('right-column');
      var rightColumnWidth = rightColumn.offsetWidth;
      var canvas = document.getElementById('drawing-canvas');

      var gameContainer = document.getElementById('game-container');
      var windowWidth = gameContainer.clientWidth;
      var windowHeight = gameContainer.clientHeight;

      var leftMinWidth = parseInt(leftColumnStyle.getPropertyValue('min-width'), 10);
      var leftMaxWidth = parseInt(leftColumnStyle.getPropertyValue('max-width'), 10);

      // Maximum width of middle column possible based on left and right elements
      var maxMiddleWidth = windowWidth - rightColumn.offsetWidth - leftMinWidth;
      var middlePadding = parseInt(middleColumnStyle.getPropertyValue('padding-left'), 10) +
                          parseInt(middleColumnStyle.getPropertyValue('padding-right'), 10);

      // Maximum width of canvas based on maximum width of middle column
      var maxCanvasWidth = maxMiddleWidth - middlePadding;

      // Maximum width possible to fit vertically and maintain aspect ratio
      var canvasHeight = canvas.offsetHeight;
      var aspectRatio = CanvasSettings.RESOLUTION_WIDTH / CanvasSettings.RESOLUTION_HEIGHT;

      var canvasWidth = Math.min(maxMiddleWidth - middlePadding, canvasHeight * aspectRatio);
      canvasWidth = Math.max(canvasWidth, CanvasSettings.MIN_DISPLAY_WIDTH);
      middleColumn.style.width = canvasWidth + middlePadding + 'px';

      // Left column width is everything left over
      var leftColumnWidth = windowWidth - rightColumnWidth - middleColumn.offsetWidth;
      var spaceLeftOver = leftColumnWidth - leftMaxWidth;
      leftColumnWidth = Math.min(leftColumnWidth, leftMaxWidth);
      leftColumn.style.width = leftColumnWidth + 'px';

      // Left and right padding for space left over
      if (spaceLeftOver > 0) {
        gameContainer.style.paddingLeft = (spaceLeftOver / 2) + 'px';
        gameContainer.style.paddingRight = (spaceLeftOver / 2) + 'px';
      } else {
        gameContainer.style.paddingLeft = '0px';
        gameContainer.style.paddingRight = '0px';
      }

      // Rescale and redraw canvas contents
      if ($scope.canvas) {
        $scope.canvas.rescale();
      }
    }
    window.addEventListener('resize', function (e) {
      resizeColumns();
    });
    resizeColumns();

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('gameMessage');
      Socket.removeListener('canvasMessage');
      Socket.removeListener('userUpdate');
      Socket.removeListener('updateDrawHistory');
    });

    // Prevent backspace from leaving game page
    $document.unbind('keydown').bind('keydown', function (event) {
      var doPrevent = false;

      // Check that we are on the game page and that the backspace key was pressed
      if ($location.path() === $state.get('home').url && event.keyCode === 8) {
        var d = event.srcElement || event.target;
        // Check if an input field is selected
        if ((d.tagName.toLowerCase() === 'input' &&
              (d.type.toLowerCase() === 'text' || d.type.toLowerCase() === 'password' ||
              d.type.toLowerCase() === 'file' || d.type.toLowerCase() === 'search' ||
              d.type.toLowerCase() === 'email' || d.type.toLowerCase() === 'number' ||
              d.type.toLowerCase() === 'date' )
            ) || d.tagName.toLowerCase() === 'textarea') {
          doPrevent = d.readOnly || d.disabled;
        } else {
          doPrevent = true;
        }
      }

      if (doPrevent) {
        event.preventDefault();
      }
    });
  }
]);
