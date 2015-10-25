'use strict';

// Create the 'game' controller
angular.module('game').controller('GameController', ['$scope', '$location', '$document', '$rootScope', '$state', '$interval', '$stateParams',
  'Authentication', 'Socket', 'CanvasSettings', 'ChatSettings', 'GameSettings', 'GameLogic', 'Utils', 'TopicSettings',
  function ($scope, $location, $document, $rootScope, $state, $interval, $stateParams, Authentication, Socket,
            CanvasSettings, ChatSettings, GameSettings, GameLogic, Utils, TopicSettings) {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    $scope.isIE = isIE;

    // Useful libraries
    $scope.Math = window.Math;

    // Room
    $scope.roomName = $stateParams.roomName;

    // Settings objects
    $scope.CanvasSettings = CanvasSettings;
    $scope.ChatSettings = ChatSettings;
    $scope.GameSettings = GameSettings;
    $scope.TopicSettings = TopicSettings;
    $scope.Object = Object;

    // Pregame settings for host to change
    $scope.chosenSettings = {
      numRounds : GameSettings.numRounds.default,
      roundTime : GameSettings.roundTime.default,
      timeAfterGuess : GameSettings.timeAfterGuess.default,
      topicListName: TopicSettings.topicListName.default,
      topicListDifficulty: TopicSettings.topicListDifficulty.default
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
      [{title: 'black', value: 'black'}, {title: 'grey', value: 'grey'}, {title: 'white', value: 'white'}],
      [{title: 'dark brown', value: 'brown'}, {title: 'brown', value: 'chocolate'}, {title: 'pink', value: 'pink'}],
      [{title: 'red', value: 'red'}, {title: 'orange', value: 'orange'}, {title: 'yellow', value: '#ffef00'}],
      [{title: 'purple', value: 'blueviolet'}, {title: 'green', value: 'limegreen'}, {title: 'light green', value: 'greenyellow'}],
      [{title: 'dark blue', value: 'mediumblue'}, {title: 'blue', value: 'dodgerblue'}, {title: 'light blue', value: 'lightskyblue'}]
    ];

    $scope.Game = new GameLogic.Game($scope.chosenSettings);
    $scope.Utils = Utils;

    $scope.messageText = '';
    $scope.timeLeft = 0;

    // If user is not signed in then redirect to signin page
    if (!Authentication.user) {
      $location.path('/authentication/signin');
    } else {
      $scope.username = Authentication.user.username;
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect(function () {
        Socket.emit('requestState', $scope.roomName);
      });
    } else {
      // We are already connected but in a new window - request to be brought up to scratch
      Socket.emit('requestState', $scope.roomName);
    }

    var scroller = document.getElementById('chat-container');
    var ieIsEnd = function () {
      var diff = (scroller.scrollTop - (scroller.scrollHeight - scroller.offsetHeight));
      return (-20 < diff && diff < 20); // close enough
    };
    var ieScroll = function() {
      if (isIE) {
        scroller.scrollTop = scroller.scrollHeight;
      }
    };

    $scope.toolboxUsable = function () {
      return $scope.Game.started && $scope.Game.isDrawer($scope.username) || $scope.Game.finished;
    };

    /*
     * Set the game state based on what the server tells us it currently is
     */
    Socket.on('gameState', function (state) {
      angular.extend($scope.Game, state);

      // sync current pregame settings with server
      for (var setting in $scope.chosenSettings) {
        $scope.chosenSettings[setting] = $scope.Game[setting];
      }

      // We now know what the state of the game is, so we can resize appropriately
      resizeColumns();
      resizeColumns();
    });

    /*
     * A round has finished
     */
    Socket.on('advanceRound', function () {
      $scope.Game.advanceRound();
      $scope.timerTop.restart(undefined, $scope.Game.roundTime * 1000);
      $scope.timerBot.pause();
      $scope.timerBot.delay = $scope.Game.timeAfterGuess * 1000;
    });

    /*
     * The game has finished and is ready to be restarted
     */
    Socket.on('resetGame', function () {
      $scope.canvas.draw({type: 'clear'});
      $scope.Game.resetGame();

      // Game layout changes, resize to get the toolbox to display properly
      // No idea why this has to be done twice
      resizeColumns();
      resizeColumns();
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
      var ieNeedsScroll = false;
      if (isIE && (ieIsEnd() || Array.isArray(message))) {
        ieNeedsScroll = true;
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

      if (ieNeedsScroll) {
        ieScroll();
        setTimeout(ieScroll, 100); // Wait a bit for element to load
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

    // Server tells us what the current topic is (should only happen if we are the drawer now)
    Socket.on('topic', function (topic) {
      $scope.topic = topic;
    });

    // After the requestState, we get the time left and pausedness of both timers
    Socket.on('updateTime', function (timers) {
      $scope.timerTop = new Utils.Timer();
      $scope.timerBot = new Utils.Timer();
      if (timers.timerTop.paused) {
        $scope.timerTop.delay = timers.timerTop.delay;
      } else {
        $scope.timerTop.restart(undefined, timers.timerTop.delay);
      }
      if (timers.timerBot.paused) {
        $scope.timerBot.delay = timers.timerBot.delay;
      } else {
        $scope.timerBot.restart(undefined, timers.timerBot.delay);
      }
    });

    // First guess has been made, so switch timer to countdown the second one
    Socket.on('switchTimer', function () {
      $scope.timerTop.pause();
      $scope.timerBot.start();
    });

    // Update timer values within the angular digest cycle so that the changes
    // are visible to the client view
    $interval(function () {
      if ($scope.timerTop) {
        $scope.timerTopLeft = $scope.timerTop.timeLeft();
      } else {
        $scope.timerTopLeft = 0;
      }
      if ($scope.timerBot) {
        $scope.timerBotLeft = $scope.timerBot.timeLeft();
      } else {
        $scope.timerBotLeft = 0;
      }
    }, 50);

    // Server tells client the game has started with the given settings
    Socket.on('startGame', function(settings) {
      angular.extend($scope.Game, settings);
      $scope.Game.startGame();
      $scope.timerTop.restart(undefined, $scope.Game.roundTime * 1000);
      $scope.timerBot.delay = $scope.Game.timeAfterGuess * 1000;

      // Game layout changes, resize to get the toolbox to display properly
      resizeColumns();
      resizeColumns();
    });

    Socket.on('gameFinished', function() {
      $scope.Game.finished = true;
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
      var ieNeedsScroll = false;
      if (isIE && ieIsEnd()) {
        ieNeedsScroll = true;
      }

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

      if (ieNeedsScroll) {
        ieScroll();
      }
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
      var settings = document.getElementById('settings');
      var middleColumn = document.getElementById('middle-column');
      var rightColumn = document.getElementById('right-column');
      var canvas = document.getElementById('drawing-canvas');

      var gameContainer = document.getElementById('game-container');
      var windowWidth = gameContainer.clientWidth;
      var windowHeight = gameContainer.clientHeight;

      var leftMinWidth = parseInt(leftColumnStyle.getPropertyValue('min-width'), 10);
      var leftMaxWidth = parseInt(leftColumnStyle.getPropertyValue('max-width'), 10);

      settings.style.display = 'none';
      leftColumn.style.display = 'flex';
      middleColumn.style.display = 'flex';
      rightColumn.style.display = 'block';
      var middleColumnStyle = window.getComputedStyle(middleColumn, null);
      var rightColumnWidth = rightColumn.offsetWidth + 10;

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
      var middleColumnWidth = canvasWidth + middlePadding;
      middleColumnWidth -= 20; // Fix display on firefox
      middleColumn.style.width = middleColumnWidth + 'px';

      // Left column width is everything left over
      var spaceLeftOver = windowWidth - rightColumnWidth - middleColumn.offsetWidth;

      // Rescale and redraw canvas contents
      if ($scope.canvas) {
        $scope.canvas.rescale();
      }

      if (!$scope.Game.started) {
        settings.style.display = 'block';
        middleColumn.style.display = 'none';

        // Settings width is same as min window width would otherwise be
        settings.style.width = middleColumnWidth + 'px';
      }
      var leftColumnWidth = Math.min(spaceLeftOver, leftMaxWidth);
      leftColumn.style.width = leftColumnWidth + 'px';
      spaceLeftOver -= leftColumnWidth;

      // Left and right padding for space left over
      if (spaceLeftOver > 0) {
        // Break 0.5 double rounding up
        gameContainer.style.paddingLeft = Math.round(spaceLeftOver / 2 - 0.01) + 'px';
        gameContainer.style.paddingRight = Math.round(spaceLeftOver / 2 + 0.01) + 'px';
      } else {
        gameContainer.style.paddingLeft = '0px';
        gameContainer.style.paddingRight = '0px';
      }

      $scope.loaded = true; // We can display things now
    }
    function windowResize (e) {
      resizeColumns();
      resizeColumns();
    }
    window.addEventListener('resize', windowResize);

    $scope.leaveRoom = function () {
      $state.go('home');
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.emit('leaveRoom');
      Socket.removeListener('gameState');
      Socket.removeListener('advanceRound');
      Socket.removeListener('resetGame');
      Socket.removeListener('markCorrectGuess');
      Socket.removeListener('userConnect');
      Socket.removeListener('userDisconnect');
      Socket.removeListener('gameMessage');
      Socket.removeListener('canvasMessage');
      Socket.removeListener('topic');
      Socket.removeListener('updateTime');
      Socket.removeListener('switchTimer');
      Socket.removeListener('startGame');
      Socket.removeListener('gameFinished');
      Socket.removeListener('changeSetting');
      window.removeEventListener('resize', windowResize);
    });

    // Prevent backspace from leaving game page
    $document.unbind('keydown').bind('keydown', function (event) {
      var doPrevent = false;

      // Check that we are on the game page and that the backspace key was pressed
      if ($state.is('game') && event.keyCode === 8) {
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
