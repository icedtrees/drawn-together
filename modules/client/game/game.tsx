import * as React from 'react'
import * as GameConfig from '../../shared/game/config/game.shared.game.config'
import {Game} from '../../shared/game/helpers/game.shared.gamelogic'
import {Timer, toCommaListIs} from '../../shared/game/helpers/game.shared.utils'
import {MAX_MSG_LEN, MAX_MESSAGES} from '../../shared/game/config/game.shared.chat.config'
import {currentSocket, useAddSocketListener} from "../core/services/socket.io.client.service";
import './css/chat.css'
import './css/drawing.css'
import './css/game-shared.css'
import './css/game.css'
import './css/lobby-info.css'
import './css/player-list.css'
import './css/pregame.css'
import './css/range-slider.css'
import './css/toolbox.css'

export const GamePage = ({user, roomName, setPage, setRoomName}) => {
  const [game, setGame] = React.useState(new Game())
  const [timerTop, setTimerTop] = React.useState(null)
  const [timerBottom, setTimerBottom] = React.useState(null)
  const [topic, setTopic] = React.useState(null)

  useAddSocketListener('gameState', (state) => {
    // Game host tells server to start game with chosen settings
    // Set the game state based on what the server tells us it currently is
    console.log("updating game...", state)
    setGame(Object.assign(new Game(), game, state))
  }, [game, setGame])

  useAddSocketListener('updateSetting', (change) => {
    // Server tells client a setting has been updated
    console.log('updating setting...', change)
    setGame(Object.assign(new Game(), game, {[change.setting]: change.option}))
  }, [game, setGame])

  useAddSocketListener('startGame', () => {
    // Server tells client the game has started with the given settings
    const newGame = Object.assign(new Game(), game)
    newGame.startGame();
    setGame(newGame)

    const newTimerTop = Object.assign(new Timer(), timerTop)
    newTimerTop.restart(undefined, game.roundTime * 1000);
    setTimerTop(newTimerTop)

    setTimerBottom(Object.assign(new Timer(), timerBottom, {delay: game.timeAfterGuess * 1000}))
  }, [game, setGame])


  // Server tells us what the current topic is (should only happen if we are the drawer now)
  useAddSocketListener('topic', (t) => { setTopic(t)}, [setTopic])

  useAddSocketListener('updateTime', (serverTimers) => {
    // After the requestState, we get the time left and pausedness of both timers
    const newTimerTop = new Timer()
    if (serverTimers.timerTop.paused) {
      newTimerTop.delay = serverTimers.timerTop.delay;
    } else {
      newTimerTop.restart(undefined, serverTimers.timerTop.delay);
    }
    setTimerTop(newTimerTop)

    const newTimerBottom = new Timer()
    if (serverTimers.timerBot.paused) {
      newTimerBottom.delay = serverTimers.timerBot.delay;
    } else {
      newTimerBottom.restart(undefined, serverTimers.timerBot.delay);
    }
    setTimerBottom(newTimerBottom)
  }, [setTimerTop, setTimerBottom])

  useAddSocketListener('switchTimer', () => {
    // First guess has been made, so switch timer to countdown the second one
    const newTimerTop = Object.assign(new Timer(), timerTop)
    newTimerTop.pause()
    setTimerTop(newTimerTop)
    const newTimerBottom = Object.assign(new Timer(), timerBottom)
    newTimerBottom.pause()
    setTimerBottom(newTimerBottom)
  }, [timerTop, setTimerTop, timerBottom, setTimerBottom])

  useAddSocketListener('advanceRound', () => {
    // A round has finished
    const newGame = Object.assign(new Game(), game)
    newGame.advanceRound()
    setGame(newGame)
    const newTimerTop = Object.assign(new Timer(), timerTop)
    newTimerTop.restart(undefined, game.roundTime * 1000)
    setTimerTop(newTimerTop)
    const newTimerBottom = Object.assign(new Timer(), timerBottom)
    newTimerBottom.pause()
    newTimerBottom.delay = game.timeAfterGuess * 1000
  }, [game, setGame, timerTop, setTimerTop, timerBottom, setTimerBottom])

  useAddSocketListener('resetGame', () => {
    // The game has finished and is ready to be restarted
    // $scope.canvas.draw({type: 'clear'});
    const newGame = Object.assign(new Game(), game)
    newGame.resetGame();
    setGame(newGame)
  }, [game, setGame])

  // Update score when someone guesses correctly
  useAddSocketListener('markCorrectGuess', (username) => {
    const newGame = Object.assign(new Game(), game)
    newGame.markCorrectGuess(username);
    setGame(newGame)
  }, [game, setGame]);

  // Another user has connected or disconnected.
  useAddSocketListener('userConnect', (user) => {
    const newGame = Object.assign(new Game(), game)
    newGame.addUser(user.username, user.image);
    setGame(newGame)
  }, [game, setGame]);
  useAddSocketListener('userDisconnect', (user) => {
    const newGame = Object.assign(new Game(), game)
    newGame.removeUser(user);
    setGame(newGame)
  }, [game, setGame]);

  React.useEffect(() => {
    console.log("requesting state from game.tsx for room", roomName)
    currentSocket.socket.emit('requestState', roomName)
    return () => {
      currentSocket.socket.emit('leaveRoom')
    }
  }, [])

  return (
    <>
      <section
        className="game-page"
      >
        <div className="left-column">
          <LobbyInformation topicListName={game.topicListName} roomName={roomName} onLeaveRoom={() => {
            setRoomName(null)
            setPage('lobby')
            window.state.go('home')
          }}/>
          <PlayerList game={game}/>
          <MessageSection/>
        </div>
        <div className="middle-column">
          {!game.started && (
            <PreGameSettings user={user} game={game} setGame={setGame}/>
          )}
          {game.started && (
            <DrawingSection game={game} topic={topic} user={user} timerTop={timerTop} timerBottom={timerBottom}/>
          )}
        </div>
        <div className="right-column" ng-disabled="!toolboxUsable()">
          <DrawingTools/>
        </div>
      </section>
    </>
  )
}

const LobbyInformation = ({topicListName, roomName, onLeaveRoom}) => {
  return (
    <div className="lobby-info ui-panel unselectable bg-primary">
      <h4>
        <span>{roomName}</span>
      </h4>
      <h5>
        Topic: <span>{topicListName}</span>
      </h5>
      <button className="btn leave-lobby" onClick={onLeaveRoom}>
        <i className="fa fa-sign-out" style={{ paddingRight: 2 }} /> Leave
        Room
      </button>
    </div>
  )
}

const PlayerList = ({game}) => {
  return (
    <div className="unselectable">
      <div className="text-center players-header">
        Players ({game.userList.length}/16)
      </div>
      <ul className="list-unstyled player-list">
        {game.userList.map((username) => {
          return (
            <li className="row" key={username}>
              <div className="player-image col">
                <img
                  src={game.getUserProfileImage(username)}
                  title={user}
                  className="game-profile-image"
                />
              </div>
              <div className="player-names col">
                <div className={game.isDrawer(username) ? 'game-drawer':''}>
                  <i
                    ng-if="Game.getHost() === user"
                    title="Host"
                    className="fa fa-star"
                  />
                  {username}
                </div>
              </div>
              <div className="player-score">
                {game.isDrawer(username) && (
                  <div>
                    <strong ng-bind="Game.users[user].score.toString()" />
                  </div>
                )}
                {!game.isDrawer(username) && (
                  <div>
                    {game.users[username].score.toString()}
                    {game.userHasGuessed(username) && (
                      <i
                        title="Guessed the prompt!"
                        className="fa fa-check user-guessed"
                      />
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const MessageSection = () => {
  const [inputMessage, setInputMessage] = React.useState('')
  const [messages, setMessages] = React.useState([])
  const chatContainerRef = React.useRef(null)
  // If we are close to the bottom of the container, automatically scroll to the bottom again
  const needToScroll = React.useRef(false)

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
  useAddSocketListener('gameMessage', (serverMessages) => {
    const container = chatContainerRef.current
    const distanceFromBottom = (container.scrollTop - (container.scrollHeight - container.offsetHeight));
    needToScroll.current = -20 < distanceFromBottom && distanceFromBottom < 20
    const newMessages = [...messages]
    if (Array.isArray(serverMessages)) {
      serverMessages.forEach(function (m) {
        newMessages.push(m)
      });
    } else {
      newMessages.push(serverMessages)
    }

    // delete old messages if MAX_MESSAGES is exceeded
    while (newMessages.length > MAX_MESSAGES) {
      newMessages.shift();
    }
    setMessages(newMessages)
  }, [messages, setMessages])

  React.useEffect(() => {
    if (needToScroll.current) {
      const container = chatContainerRef.current
      container.scrollTop = container.scrollHeight;
      needToScroll.current = false
    }
  })

  const sendMessage = () => {
    // Disallow empty messages
    if (/^\s*$/.test(inputMessage)) {
      setInputMessage('')
      return
    }

    // Create a new message object
    const message = {
      text: inputMessage
    };

    // Emit a 'gameMessage' message event
    currentSocket.socket.emit('gameMessage', message)

    // Clear the message text
    setInputMessage('')
  };
  return (
    <>
      <div
        id="chat-container"
        className="chat-container"
        ref={chatContainerRef}
      >
        <div className="game-message-box">
          <ul className="list-unstyled">
            {messages.map((message, i) => {
              return (
                <li className={"col-xs-12 col-md-12 game-message wordwrap" + ' ' + message.class} key={i}>
                  {message.class !== 'status' && (
                    <span className="username">
                      {message.username}:
                    </span>
                  )}
                  {message.class !== 'status' && (
                    <span className="message-text">{message.text}</span>
                  )}
                  {message.class === 'status' && (
                    // todo: sanitize
                    <span className="message-text" dangerouslySetInnerHTML={{__html: message.text}}/>
                  )}
                  <div className="game-message-addon">{message.addon}</div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div className="message-form col-xs-12 col-md-12">
        <form className="col-xs-12 col-md-12" onSubmit={(e) => {
          sendMessage()
          e.preventDefault() // Do not submit form and reload page
        }}>
          <fieldset className="row">
            <div className="input-group col-xs-12 col-md-12">
              <input
                autoComplete="off"
                ng-disabled="Game.isDrawer(username) && Game.started"
                type="text"
                id="messageText"
                name="messageText"
                className="form-control message-input"
                maxLength={MAX_MSG_LEN}
                placeholder="Enter new message"
                onChange={(e) => setInputMessage(e.target.value)}
                value={inputMessage}
              />
            </div>
          </fieldset>
        </form>
      </div>
    </>
  )
}

const PreGameSettings = ({game, setGame, user}) => {
  const [topicList, setTopicList] = React.useState(null)
  React.useEffect(() => {
    if (topicList) {
      return
    }
    console.log('fetching topics...')
    fetch('/api/topics').then((response) => {
      return response.json()
    }).then((topics) => {
      console.log('fetched topics')
      setGame(Object.assign(new Game(), game, {topicListName: topics[0].name}))
      setTopicList(topics)
    })
  }, [game, setGame, topicList, setTopicList])

  const isHost = user.username === game.getHost()

  // Game host updates a setting
  const onChangeSetting = function (setting, option) {
    if (/*!game.started &&*/isHost) {
      // Send to server so all other players can update this setting
      currentSocket.socket.emit('changeSetting', {setting : setting, option : option});
      setGame(Object.assign(new Game(), game, {[setting]: option}))
    }
  };

  if (!topicList) {
    return null
  }

  return (
    <div
      id="settings"
      className="col"
      style={{ height: "100%", textAlign: "center" }}
    >
      <div className="drawing-header-pregame unselectable">
        <span>{(isHost ? 'You are' : game.getHost() + ' is')} choosing the game settings...</span>
      </div>
      <div
        className={"settings-body" + (!isHost ? ' non-host' : '')}
      >
        <div className="pregame-group row">
          <div className="col-xs-4 pregame-group-left">
            <div className="pregame-setting-name">
              <span className="unselectable">Topic</span>
            </div>
          </div>
          <div className="col-xs-8 pregame-group-right">
            {isHost && (
              <select
                id="topic-selector"
                className="form-control"
                onChange={(e) => {
                  onChangeSetting('topicListName', e.target.value)
                }}
                value={game.topicListName}
              >
                {topicList.map((topic) => {
                  return (
                    <option key={topic.name}>
                      {topic.name}
                    </option>
                  )
                })}
              </select>
            )}
            {!isHost && (
              <div
                className="btn btn-warning pregame-button pregame-display-topic unselectable active"
              >
                {game.topicListName}
              </div>
            )}
          </div>
        </div>
        <div style={{ height: "2em" }} />
        {
          ['numRounds', 'roundTime', 'timeAfterGuess'].map((setting: string) => {
            const settingsData = GameConfig[setting]
            return (
              <div key={setting}>
                <Setting chosen={game[setting] ?? settingsData.default} onChangeSetting={onChangeSetting} setting={setting} isHost={isHost}/>
              </div>
            )
          })
        }
        {isHost && (
          <div className="col-md-12 start-game-div">
            <button
              className="btn btn-primary"
              onClick={() => currentSocket.socket.emit('startGame')}
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>

  )
}

const Setting = ({setting, isHost, onChangeSetting, chosen}) => {
  const settingConfig = GameConfig[setting]
  return (
    <div
      className="pregame-group row"
      ng-init="value = GameSettings[setting]"
    >
      <div className="col-xs-4 pregame-group-left">
        <div className="pregame-setting-name">
          <span className="unselectable">{settingConfig.settingName}</span>
        </div>
      </div>
      <div className="col-xs-8 pregame-group-right">
        {settingConfig.options.map((option) => {
          return (
            <div className="btn-group" key={option}>
              {!isHost && (
                <div className={"btn btn-success pregame-button pregame-display-game unselectable" + (chosen === option ? ' active' : '')}>
                  {option}
                </div>
              )}
              {isHost && (
                <label
                  className={"btn btn-success pregame-button" + (chosen === option ? ' active' : '')}
                  onClick={() => onChangeSetting(setting, option)}
                  btn-radio="option"
                >
                  {option}
                </label>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DrawingSection = ({game, topic, user, timerTop, timerBottom}) => {
  return (
    <>
      <div className="drawing-header">
        <div className="drawing-header-buttons">
          <button
            className="btn btn-primary vertical-center"
            disabled={!game.isDrawer(user.username) || game.correctGuesses !== 0}
            onClick={() => {currentSocket.socket.emit('finishDrawing')}}
          >
            <i className="fa fa-hourglass-end" style={{ paddingRight: 4 }} />{" "}
            Pass
          </button>
        </div>
        <div className="drawing-header-text vertical-center">
          <div className="text-center unselectable">
            {game.currentRound !== undefined && game.numRounds !== undefined && (
              <span>
                {game.finished ? 'Game over!' : ('Round ' + (game.currentRound + 1) + '/' + game.numRounds + ':')}
              </span>
            )}
            {!!game.getDrawers().length && (
              <span>
                {game.isDrawer(user.username) ? `Draw "${topic}"` : `${toCommaListIs(game.getDrawers())} drawing`}
              </span>
            )}
          </div>
        </div>
      </div>
      {timerTop && (
        <TimerComponent color={'lightgreen'} gameFinished={game.finished} timer={timerTop} totalTime={game.roundTime}/>
      )}
      {timerBottom && (
        <TimerComponent color={'pink'} gameFinished={game.finished} timer={timerBottom} totalTime={game.timeAfterGuess}/>
      )}
      <div id="drawing-canvas" className="dt-drawing" />
    </>
  )
}

const TimerComponent = ({gameFinished, color, timer, totalTime}) => {
  const [timeLeft, setTimeLeft] = React.useState(timer.timeLeft())
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timer.timeLeft())
    })
    return () => clearInterval(interval)
  }, [timer])
  return (
    <div className={'drawing-timer-wrapper' + (gameFinished ? ' game-over': '')}>
      <div
        className="drawing-timer"
        style={{'backgroundColor': timer.paused ? 'grey' : color, 'width': timeLeft / 10 / totalTime + '%'}}
      />
    </div>
  )
}

const DrawingTools = () => {
  return (
    <>
      <div className="grid">
        <div className="grid-row" ng-repeat="drawToolRow in drawTools">
          <div
            ng-repeat="drawTool in drawToolRow"
            ng-class="{'grid-cell': true, 'draw-tool': true, 'selected': $parent.$parent.mouseMode === drawTool.type}"
            ng-attr-title="{{drawTool.type}}"
            ng-click="toolboxUsable() && ($parent.$parent.mouseMode = drawTool.type)"
          >
            <div className="draw-tool-content">
              <i className="fa fa-{{drawTool.glyph}}" />
            </div>
          </div>
        </div>
      </div>
      {/* Size slider */}
      <div>
        <div className="size-triangle" />
        <input
          className="size-slider"
          type="range"
          ng-model="drawWidth[mouseMode]"
          min="{{CanvasSettings.MIN_DRAW_WIDTH}}"
          max="{{CanvasSettings.MAX_DRAW_WIDTH}}"
          ng-disabled="!toolboxUsable()"
        />
        <p className="unselectable">Size</p>
      </div>
      {/* Colour palette */}
      <div className="grid" style={{ marginBottom: 10 }}>
        <div className="grid-row" ng-repeat="paletteRow in paletteColours">
          <div
            ng-repeat="paletteColour in paletteRow"
            ng-class="{'grid-cell': true, 'palette-colour': true, 'selected': $parent.$parent.penColour === paletteColour.value}"
            ng-style="{'background-color': paletteColour.value}"
            ng-attr-title="{{paletteColour.title}}"
            ng-click="toolboxUsable() && (($parent.$parent.mouseMode = 'pen') && ($parent.$parent.penColour = paletteColour.value))"
          ></div>
        </div>
        <div
          className="custom-palette-colour-wrapper unselectable"
          ng-click="toolboxUsable() && ((mouseMode = 'pen') && (penColour = penColourCustom))"
        >
          <div
            ng-if="toolboxUsable()"
            ng-model="selectCustomColour"
            ng-model-options="{getterSetter: true}"
            colorpicker=""
            colorpicker-position="left"
            colorpicker-parent="true"
            ng-class="{'grid-cell': true, 'palette-colour': true, 'custom-palette-colour': true, 'selected': penColour === penColourCustom}"
            ng-style="{'background-color': penColourCustom}"
            ng-attr-title="{{penColourCustom}}"
            style={{ cursor: "pointer" }}
          ></div>
          <div
            ng-if="!toolboxUsable()"
            ng-class="{'grid-cell': true, 'palette-colour': true, 'custom-palette-colour': true, 'selected': penColour === penColourCustom}"
            ng-style="{'background-color': penColourCustom}"
            ng-attr-title="{{penColourCustom}}"
          ></div>
        </div>
        <p className="unselectable">Custom colour</p>
      </div>
      <div style={{ marginBottom: 0, marginTop: 12 }}>
        <button
          className="btn btn-primary clear-canvas"
          ng-disabled="!toolboxUsable() || Game.finished"
          ng-click="clearDrawing()"
        >
          Clear Canvas
        </button>
      </div>
    </>
  )
}