"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePage = void 0;
const React = __importStar(require("react"));
const GameConfig = __importStar(require("../../shared/game/config/game.shared.game.config"));
const game_shared_gamelogic_1 = require("../../shared/game/helpers/game.shared.gamelogic");
const game_shared_utils_1 = require("../../shared/game/helpers/game.shared.utils");
const game_shared_chat_config_1 = require("../../shared/game/config/game.shared.chat.config");
const socket_io_client_service_1 = require("../core/services/socket.io.client.service");
const canvas_1 = require("./canvas");
require("font-awesome/css/font-awesome.css");
require("./css/chat.css");
require("./css/drawing.css");
require("./css/game-shared.css");
require("./css/game.css");
require("./css/lobby-info.css");
require("./css/player-list.css");
require("./css/pregame.css");
require("./css/range-slider.css");
require("./css/toolbox.css");
const game_client_config_1 = require("./config/game.client.config");
const GamePage = ({ user, roomName, setPage }) => {
    const [game, setGame] = React.useState(new game_shared_gamelogic_1.Game());
    const [timerTop, setTimerTop] = React.useState(null);
    const [timerBottom, setTimerBottom] = React.useState(null);
    const [topic, setTopic] = React.useState(null);
    (0, socket_io_client_service_1.connectSocket)(user); // todo: this should probably be done in a more centralised place
    (0, socket_io_client_service_1.useAddSocketListener)('gameState', (state) => {
        setGame((game) => { return Object.assign(new game_shared_gamelogic_1.Game(), game, state); });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('updateSetting', (change) => {
        setGame((game) => { return Object.assign(new game_shared_gamelogic_1.Game(), game, { [change.setting]: change.option }); });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('startGame', () => {
        // Server tells client the game has started with the given settings
        setGame((game) => {
            const newGame = Object.assign(new game_shared_gamelogic_1.Game(), game);
            newGame.startGame();
            return newGame;
        });
        setTimerTop((timerTop) => {
            const newTimerTop = Object.assign(new game_shared_utils_1.Timer(), timerTop);
            newTimerTop.restart(undefined, game.roundTime * 1000);
            return newTimerTop;
        });
        setTimerBottom((timerBottom) => {
            return Object.assign(new game_shared_utils_1.Timer(), timerBottom, { delay: game.timeAfterGuess * 1000 });
        });
    });
    // Server tells us what the current topic is (should only happen if we are the drawer now)
    (0, socket_io_client_service_1.useAddSocketListener)('topic', (t) => { setTopic(t); });
    (0, socket_io_client_service_1.useAddSocketListener)('updateTime', (serverTimers) => {
        // After the requestState, we get the time left and pausedness of both timers
        setTimerTop((timerTop) => {
            const newTimerTop = new game_shared_utils_1.Timer();
            if (serverTimers.timerTop.paused) {
                newTimerTop.delay = serverTimers.timerTop.delay;
            }
            else {
                newTimerTop.restart(undefined, serverTimers.timerTop.delay);
            }
            return newTimerTop;
        });
        setTimerBottom((timerBottom) => {
            const newTimerBottom = new game_shared_utils_1.Timer();
            if (serverTimers.timerBot.paused) {
                newTimerBottom.delay = serverTimers.timerBot.delay;
            }
            else {
                newTimerBottom.restart(undefined, serverTimers.timerBot.delay);
            }
            return newTimerBottom;
        });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('switchTimer', () => {
        // First guess has been made, so switch timer to countdown the second one
        setTimerTop((timerTop) => {
            const newTimerTop = Object.assign(new game_shared_utils_1.Timer(), timerTop);
            newTimerTop.pause();
            return newTimerTop;
        });
        setTimerBottom((timerBottom) => {
            const newTimerBottom = Object.assign(new game_shared_utils_1.Timer(), timerBottom);
            newTimerBottom.start();
            return newTimerBottom;
        });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('advanceRound', () => {
        // A round has finished
        setGame((game) => {
            const newGame = Object.assign(new game_shared_gamelogic_1.Game(), game);
            newGame.advanceRound();
            return newGame;
        });
        setTimerTop((timerTop) => {
            const newTimerTop = Object.assign(new game_shared_utils_1.Timer(), timerTop);
            newTimerTop.restart(undefined, game.roundTime * 1000);
            return newTimerTop;
        });
        setTimerBottom((timerBottom) => {
            const newTimerBottom = Object.assign(new game_shared_utils_1.Timer(), timerBottom);
            newTimerBottom.pause();
            newTimerBottom.delay = game.timeAfterGuess * 1000;
            return newTimerBottom;
        });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('resetGame', () => {
        // The game has finished and is ready to be restarted
        onClearDrawing();
        setGame((game) => {
            const newGame = Object.assign(new game_shared_gamelogic_1.Game(), game);
            newGame.resetGame();
            return newGame;
        });
    });
    // Update score when someone guesses correctly
    (0, socket_io_client_service_1.useAddSocketListener)('markCorrectGuess', (username) => {
        setGame((game) => {
            const newGame = Object.assign(new game_shared_gamelogic_1.Game(), game);
            newGame.markCorrectGuess(username);
            return newGame;
        });
    });
    // Another user has connected or disconnected.
    (0, socket_io_client_service_1.useAddSocketListener)('userConnect', (user) => {
        setGame((game) => {
            const newGame = Object.assign(new game_shared_gamelogic_1.Game(), game);
            newGame.addUser(user.username, user.image);
            return newGame;
        });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('userDisconnect', (user) => {
        setGame((game) => {
            const newGame = Object.assign(new game_shared_gamelogic_1.Game(), game);
            newGame.removeUser(user);
            return newGame;
        });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('gameFinished', () => {
        setGame((game) => { return Object.assign(new game_shared_gamelogic_1.Game(), game, { finished: true }); });
    });
    React.useEffect(() => {
        socket_io_client_service_1.currentSocket.socket.emit('requestState', roomName);
        return () => {
            socket_io_client_service_1.currentSocket.socket.emit('leaveRoom');
        };
    }, [roomName]);
    // Disable drawing half the time for co-op mode
    const [disableDrawing, setDisableDrawing] = React.useState(false);
    React.useEffect(() => {
        const checkBanDrawing = () => {
            let disable = false;
            if (game.numDrawers > 1 && game.userList.length > 1) {
                const drawerIndex = game.getDrawers().indexOf(user.username);
                let timeSinceStart = null;
                let fractionElapsed = null;
                if (timerTop && timerTop.timeStarted && !timerTop.paused) {
                    timeSinceStart = Date.now() - timerTop.timeStarted;
                    fractionElapsed = timeSinceStart / timerTop.delay;
                }
                if (timerBottom && timerBottom.timeStarted && !timerBottom.paused) {
                    timeSinceStart = Date.now() - timerBottom.timeStarted;
                    fractionElapsed = timeSinceStart / timerBottom.delay;
                }
                if (timeSinceStart) {
                    const offset = Math.floor(fractionElapsed * game_client_config_1.CO_OP_INTERVAL_COUNT) % game.numDrawers;
                    if (drawerIndex === offset) {
                        disable = true;
                    }
                }
            }
            setDisableDrawing(disable);
        };
        // Every 1 second, check if we should ban drawing based on co-op state
        checkBanDrawing();
        const interval = setInterval(checkBanDrawing, 1000);
        return () => clearInterval(interval);
    }, [game, timerTop, user, setDisableDrawing]);
    const canDraw = game.finished || (game.isDrawer(user.username) && !disableDrawing);
    const [drawWidth, setDrawWidth] = React.useState({ pen: game_client_config_1.CanvasSettings.DEFAULT_PEN_WIDTH, eraser: game_client_config_1.CanvasSettings.DEFAULT_ERASER_WIDTH });
    const [penColour, setPenColour] = React.useState(game_client_config_1.CanvasSettings.DEFAULT_PEN_COLOUR);
    const [mouseMode, setMouseMode] = React.useState('pen');
    const canvasRef = React.useRef();
    const onClearDrawing = () => {
        const message = { type: 'clear' };
        socket_io_client_service_1.currentSocket.socket.emit('canvasMessage', message);
        canvasRef.current.clearCanvas();
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("section", { className: "game-page" },
            React.createElement("div", { className: "left-column" },
                React.createElement(LobbyInformation, { onLeaveRoom: () => {
                        setPage({ view: 'lobby' });
                    }, roomName: roomName, game: game, topicListName: game.topicListName }),
                React.createElement(PlayerList, { game: game }),
                React.createElement(MessageSection, { canMessage: !(game.isDrawer(user.username) && game.started) })),
            React.createElement("div", { className: "all-drawing" },
                React.createElement("div", { className: "middle-column" },
                    !game.started && (React.createElement(PreGameSettings, { user: user, game: game, setGame: setGame })),
                    game.started && (React.createElement(DrawingSection, { game: game, canDraw: canDraw, topic: topic, user: user, timerTop: timerTop, timerBottom: timerBottom, mouseMode: mouseMode, penColour: penColour, drawWidth: drawWidth, ref: canvasRef }))),
                React.createElement("div", { className: "right-column toolbox", disabled: !canDraw },
                    React.createElement(DrawingTools, { canDraw: canDraw, gameFinished: game.finished, drawWidth: drawWidth, setDrawWidth: setDrawWidth, penColour: penColour, setPenColour: setPenColour, mouseMode: mouseMode, setMouseMode: setMouseMode, onClearDrawing: onClearDrawing }))))));
};
exports.GamePage = GamePage;
const LobbyInformation = ({ game, topicListName, roomName, onLeaveRoom }) => {
    return (React.createElement("div", { className: "lobby-info ui-panel unselectable bg-primary" },
        React.createElement("h4", null, roomName),
        React.createElement("h5", null,
            "Topic: ",
            topicListName),
        React.createElement("h5", null,
            "Status:\u00A0",
            !game.started && ('Choosing game settings...'),
            (game.started && !game.finished) && (`Round ${game.currentRound + 1}/${game.numRounds}`),
            game.finished && 'Game finished!'),
        React.createElement("button", { className: "btn leave-lobby", onClick: onLeaveRoom },
            React.createElement("i", { className: "fa fa-sign-out", style: { paddingRight: 2 } }),
            " Leave Room")));
};
const PlayerList = ({ game }) => {
    return (React.createElement("div", { className: "unselectable" },
        React.createElement("div", { className: "text-center players-header" },
            "Players (",
            game.userList.length,
            "/16)"),
        React.createElement("ul", { className: "list-unstyled player-list" }, game.userList.map((username) => {
            return (React.createElement("li", { className: "row", key: username },
                React.createElement("div", { className: "player-image col" },
                    React.createElement("img", { src: game.getUserProfileImage(username), title: username, className: "game-profile-image" })),
                React.createElement("div", { className: "player-names col" },
                    React.createElement("div", { className: game.isDrawer(username) ? 'game-drawer' : '' },
                        game.getHost() === username && (React.createElement("i", { title: "Host", className: "fa fa-star" })),
                        "\u00A0",
                        username,
                        "\u00A0",
                        game.isDrawer(username) && (React.createElement("i", { className: "fa fa-pencil-square" })))),
                React.createElement("div", { className: "player-score" },
                    game.isDrawer(username) && (React.createElement("div", null,
                        React.createElement("strong", null, game.users[username].score.toString()))),
                    !game.isDrawer(username) && (React.createElement("div", null,
                        game.users[username].score.toString(),
                        game.userHasGuessed(username) && (React.createElement("i", { title: "Guessed the prompt!", className: "fa fa-check user-guessed" })))))));
        }))));
};
const MessageSection = ({ canMessage }) => {
    const [inputMessage, setInputMessage] = React.useState('');
    const [messages, setMessages] = React.useState([]);
    const chatContainerRef = React.useRef(null);
    // If we are close to the bottom of the container, automatically scroll to the bottom again
    const needToScroll = React.useRef(false);
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
    (0, socket_io_client_service_1.useAddSocketListener)('gameMessage', (serverMessages) => {
        const container = chatContainerRef.current;
        const distanceFromBottom = (container.scrollTop - (container.scrollHeight - container.offsetHeight));
        needToScroll.current = -20 < distanceFromBottom && distanceFromBottom < 20;
        setMessages((messages) => {
            const newMessages = [...messages];
            if (Array.isArray(serverMessages)) {
                serverMessages.forEach(function (m) {
                    newMessages.push(m);
                });
            }
            else {
                newMessages.push(serverMessages);
            }
            // delete old messages if MAX_MESSAGES is exceeded
            while (newMessages.length > game_shared_chat_config_1.MAX_MESSAGES) {
                newMessages.shift();
            }
            return newMessages;
        });
    });
    React.useEffect(() => {
        if (needToScroll.current) {
            const container = chatContainerRef.current;
            container.scrollTop = container.scrollHeight;
            needToScroll.current = false;
        }
    });
    const sendMessage = () => {
        // Disallow empty messages
        if (/^\s*$/.test(inputMessage)) {
            setInputMessage('');
            return;
        }
        // Create a new message object
        const message = {
            text: inputMessage
        };
        // Emit a 'gameMessage' message event
        socket_io_client_service_1.currentSocket.socket.emit('gameMessage', message);
        // Clear the message text
        setInputMessage('');
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { id: "chat-container", className: "chat-container", ref: chatContainerRef },
            React.createElement("div", { className: "game-message-box" },
                React.createElement("ul", { className: "list-unstyled" }, messages.map((message, i) => {
                    return (React.createElement("li", { className: "col-xs-12 col-md-12 game-message wordwrap" + ' ' + message.class, key: i },
                        message.class !== 'status' && (React.createElement("span", { className: "username" },
                            message.username,
                            ":\u00A0")),
                        message.class !== 'status' && (React.createElement("span", { className: "message-text" }, message.text)),
                        message.class === 'status' && (
                        // todo: sanitize
                        React.createElement("span", { className: "message-text", dangerouslySetInnerHTML: { __html: message.text } })),
                        React.createElement("div", { className: "game-message-addon" }, message.addon)));
                })))),
        React.createElement("div", { className: "message-form col-xs-12 col-md-12" },
            React.createElement("form", { className: "col-xs-12 col-md-12", onSubmit: (e) => {
                    sendMessage();
                    e.preventDefault(); // Do not submit form and reload page
                } },
                React.createElement("fieldset", { className: "row" },
                    React.createElement("div", { className: "input-group col-xs-12 col-md-12" },
                        React.createElement("input", { autoComplete: "off", disabled: !canMessage, type: "text", id: "messageText", name: "messageText", className: "form-control message-input", maxLength: game_shared_chat_config_1.MAX_MSG_LEN, placeholder: "Enter new message", onChange: (e) => setInputMessage(e.target.value), value: inputMessage })))))));
};
const PreGameSettings = ({ game, setGame, user }) => {
    const [topicList, setTopicList] = React.useState(null);
    React.useEffect(() => {
        if (topicList) {
            return;
        }
        fetch('/api/topics').then((response) => {
            return response.json();
        }).then((topics) => {
            setGame((game) => {
                if (!game.topicListName) {
                    return Object.assign(new game_shared_gamelogic_1.Game(), game, { topicListName: topics[0].name });
                }
                return game;
            });
            setTopicList(topics);
        });
    }, [game, setGame, topicList, setTopicList]);
    const isHost = user.username === game.getHost();
    // Game host updates a setting
    const onChangeSetting = function (setting, option) {
        if (!game.started && isHost) {
            // Send to server so all other players can update this setting
            socket_io_client_service_1.currentSocket.socket.emit('changeSetting', { setting: setting, option: option });
            setGame((game) => { return Object.assign(new game_shared_gamelogic_1.Game(), game, { [setting]: option }); });
        }
    };
    if (!topicList) {
        return null;
    }
    return (React.createElement("div", { id: "settings", className: "col", style: { height: "100%", textAlign: "center" } },
        React.createElement("div", { className: "drawing-header-pregame unselectable" },
            React.createElement("span", null,
                (isHost ? 'You are' : game.getHost() + ' is'),
                " choosing the game settings...")),
        React.createElement("div", { className: "settings-body" + (!isHost ? ' non-host' : '') },
            React.createElement("div", { className: "pregame-group row" },
                React.createElement("div", { className: "col-xs-4 pregame-group-left" },
                    React.createElement("div", { className: "pregame-setting-name" },
                        React.createElement("span", { className: "unselectable" }, "Topic"))),
                React.createElement("div", { className: "col-xs-8 pregame-group-right" },
                    isHost && (React.createElement("select", { id: "topic-selector", className: "form-control", onChange: (e) => {
                            onChangeSetting('topicListName', e.target.value);
                        }, value: game.topicListName }, topicList.map((topic) => {
                        return (React.createElement("option", { key: topic.name }, topic.name));
                    }))),
                    !isHost && (React.createElement("div", { className: "btn btn-warning pregame-button pregame-display-topic unselectable active" }, game.topicListName)))),
            React.createElement("div", { style: { height: "2em" } }),
            ['numDrawers', 'numRounds', 'roundTime', 'timeAfterGuess'].map((setting) => {
                var _a;
                const settingsData = GameConfig[setting];
                return (React.createElement("div", { key: setting },
                    React.createElement(Setting, { chosen: (_a = game[setting]) !== null && _a !== void 0 ? _a : settingsData.default, onChangeSetting: onChangeSetting, setting: setting, isHost: isHost })));
            }),
            isHost && (React.createElement("div", { className: "col-md-12 start-game-div" },
                React.createElement("button", { className: "btn btn-primary", onClick: () => socket_io_client_service_1.currentSocket.socket.emit('startGame') }, "Start Game"))))));
};
const Setting = ({ setting, isHost, onChangeSetting, chosen }) => {
    const settingConfig = GameConfig[setting];
    return (React.createElement("div", { className: "pregame-group row" },
        React.createElement("div", { className: "col-xs-4 pregame-group-left" },
            React.createElement("div", { className: "pregame-setting-name" },
                React.createElement("span", { className: "unselectable" }, settingConfig.settingName))),
        React.createElement("div", { className: "col-xs-8 pregame-group-right" }, settingConfig.options.map((option, i) => {
            let displayName;
            if (settingConfig.optionDisplayNames) {
                displayName = settingConfig.optionDisplayNames[i];
            }
            else {
                displayName = option;
            }
            return (React.createElement("div", { className: "btn-group", key: option },
                !isHost && (React.createElement("div", { className: "btn btn-success pregame-button pregame-display-game unselectable" + (chosen === option ? ' active' : '') }, displayName)),
                isHost && (React.createElement("label", { className: "btn btn-success pregame-button" + (chosen === option ? ' active' : ''), onClick: () => onChangeSetting(setting, option), "btn-radio": "option" }, displayName))));
        }))));
};
const DrawingSection = React.forwardRef(({ game, topic, user, timerTop, timerBottom, canDraw, mouseMode, penColour, drawWidth }, canvasRef) => {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "drawing-header" },
            React.createElement("div", { className: "drawing-header-buttons" },
                React.createElement("button", { className: "btn btn-primary vertical-center", disabled: !game.isDrawer(user.username) || game.correctGuesses !== 0, onClick: () => { socket_io_client_service_1.currentSocket.socket.emit('finishDrawing'); } },
                    React.createElement("i", { className: "fa fa-hourglass-end", style: { paddingRight: 4 } }),
                    " ",
                    "Pass")),
            React.createElement("div", { className: "drawing-header-text vertical-center" },
                React.createElement("div", { className: "text-center unselectable" }, (() => {
                    if (game.finished) {
                        return 'Game over!';
                    }
                    if (!game.isDrawer(user.username)) {
                        return `${(0, game_shared_utils_1.toCommaListIs)(game.getDrawers())} drawing`;
                    }
                    let drawerText;
                    if (game.numDrawers === 1) {
                        drawerText = 'You';
                    }
                    else {
                        const otherDrawerNames = game.getDrawers().filter((u) => u != user.username);
                        const allDrawerNames = ['You', ...otherDrawerNames];
                        drawerText = (0, game_shared_utils_1.toCommaList)(allDrawerNames);
                    }
                    return (React.createElement(React.Fragment, null,
                        React.createElement("b", null,
                            drawerText,
                            " are drawing!"),
                        " Draw \"",
                        topic,
                        "\""));
                })()))),
        timerTop && (React.createElement(TimerComponent, { color: 'lightgreen', secondDrawerColor: '#56d556', gameFinished: game.finished, timer: timerTop, totalTime: game.roundTime, twoSlices: game.numDrawers > 1 && game.userList.length > 1 })),
        timerBottom && (React.createElement(TimerComponent, { color: 'pink', secondDrawerColor: '#cbffc0', gameFinished: game.finished, timer: timerBottom, totalTime: game.timeAfterGuess, twoSlices: game.numDrawers > 1 && game.userList.length > 1 })),
        React.createElement(canvas_1.CanvasElement, { canDraw: canDraw, mouseMode: mouseMode, penColour: penColour, drawWidth: drawWidth, ref: canvasRef })));
});
const TimerComponent = ({ gameFinished, color, secondDrawerColor, timer, totalTime, twoSlices }) => {
    const [timeLeft, setTimeLeft] = React.useState(timer.timeLeft());
    const wrapperRef = React.useRef();
    React.useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(timer.timeLeft());
        });
        return () => clearInterval(interval);
    }, [timer]);
    const timeLeftPercentage = timeLeft / 10 / totalTime;
    const style = { width: timeLeftPercentage + '%' };
    if (timer.paused) {
        style.backgroundColor = 'grey';
    }
    else if (!twoSlices) {
        style.backgroundColor = color;
    }
    else if (!wrapperRef.current) {
        // wrapper isn't rendered yet
        style.backgroundColor = color;
    }
    else {
        // Alternate slices
        const sectionWidth = Math.round(wrapperRef.current.offsetWidth / game_client_config_1.CO_OP_INTERVAL_COUNT);
        style.background = `repeating-linear-gradient(
      to right,
      ${color},
      ${color} ${sectionWidth}px,
      ${secondDrawerColor} ${sectionWidth}px,
      ${secondDrawerColor} ${sectionWidth * 2}px
    )`;
    }
    return (React.createElement("div", { className: 'drawing-timer-wrapper' + (gameFinished ? ' game-over' : ''), ref: wrapperRef },
        React.createElement("div", { className: "drawing-timer", style: style })));
};
const DrawingTools = ({ mouseMode, setMouseMode, canDraw, drawWidth, setDrawWidth, gameFinished, penColour, setPenColour, onClearDrawing }) => {
    const drawTools = [
        [{ type: 'pen', glyph: 'pencil' }, { type: 'eraser', glyph: 'eraser' }]
        //[{type: 'line', glyph: 'arrows-h'}, {type: 'fill', glyph: 'paint-brush'}],
        //[{type: 'circle', glyph: 'circle-thin'}, {type: 'rect', glyph: 'square-o'}]
    ];
    const paletteColours = [
        [{ title: 'black', value: 'black' }, { title: 'grey', value: 'grey' }, { title: 'white', value: 'white' }],
        [{ title: 'dark brown', value: 'brown' }, { title: 'brown', value: 'chocolate' }, { title: 'pink', value: 'pink' }],
        [{ title: 'red', value: 'red' }, { title: 'orange', value: 'orange' }, { title: 'yellow', value: '#ffef00' }],
        [{ title: 'purple', value: 'blueviolet' }, { title: 'green', value: 'limegreen' }, { title: 'light green', value: 'greenyellow' }],
        [{ title: 'dark blue', value: 'mediumblue' }, { title: 'blue', value: 'dodgerblue' }, { title: 'light blue', value: 'lightskyblue' }]
    ];
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid" }, drawTools.map((drawToolRow, i) => {
            return (React.createElement("div", { className: "grid-row", key: i }, drawToolRow.map(({ type, glyph }) => {
                return (React.createElement("div", { className: 'grid-cell draw-tool' + (mouseMode === type ? ' selected' : ''), key: type, title: type, onClick: () => {
                        if (canDraw) {
                            setMouseMode(type);
                        }
                    } },
                    React.createElement("div", { className: "draw-tool-content" },
                        React.createElement("i", { className: `fa fa-${glyph}` }))));
            })));
        })),
        React.createElement("div", null,
            React.createElement("div", { className: "size-triangle" }),
            React.createElement("input", { className: "size-slider", type: "range", onChange: (e) => setDrawWidth(Object.assign(Object.assign({}, drawWidth), { [mouseMode]: e.target.value })), value: drawWidth[mouseMode], min: game_client_config_1.CanvasSettings.MIN_DRAW_WIDTH, max: game_client_config_1.CanvasSettings.MAX_DRAW_WIDTH, disabled: !canDraw }),
            React.createElement("p", { className: "unselectable" }, "Size")),
        React.createElement("div", { className: "grid", style: { marginBottom: 10 } },
            paletteColours.map((paletteRow, i) => {
                return (React.createElement("div", { className: "grid-row", key: i }, paletteRow.map((paletteColour) => {
                    return (React.createElement("div", { key: paletteColour.title, className: 'grid-cell palette-colour' + (penColour === paletteColour.value ? ' selected' : ''), style: { backgroundColor: paletteColour.value }, title: paletteColour.title, onClick: () => {
                            if (canDraw) {
                                setMouseMode('pen');
                                setPenColour(paletteColour.value);
                            }
                        } }));
                })));
            }),
            React.createElement("div", { style: { marginBottom: 0, marginTop: 12 } },
                React.createElement("button", { className: "btn btn-primary clear-canvas", disabled: !canDraw || gameFinished, onClick: onClearDrawing }, "Clear")))));
};
