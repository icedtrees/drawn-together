import * as React from 'react'
import * as GameConfig from '../../shared/game/config/game.shared.game.config'
import {Game} from '../../shared/game/helpers/game.shared.gamelogic'
import {Timer, toCommaListIs, toCommaList} from '../../shared/game/helpers/game.shared.utils'
import {MAX_MSG_LEN, MAX_MESSAGES} from '../../shared/game/config/game.shared.chat.config'
import {connectSocket, currentSocket, useAddSocketListener} from "../core/services/socket.io.client.service";
import {CanvasElement} from "./canvas";

import 'font-awesome/css/font-awesome.css'
import './css/chat.css'
import './css/drawing.css'
import './css/game-shared.css'
import './css/game.css'
import './css/lobby-info.css'
import './css/player-list.css'
import './css/pregame.css'
import './css/range-slider.css'
import './css/toolbox.css'
import {CanvasSettings} from "./config/game.client.config";

export const GamePage = ({user, roomName, setPage}) => {
  const [game, setGame] = React.useState(new Game())
  const [timerTop, setTimerTop] = React.useState(null)
  const [timerBottom, setTimerBottom] = React.useState(null)
  const [topic, setTopic] = React.useState(null)

  connectSocket(user) // todo: this should probably be done in a more centralised place

  useAddSocketListener('gameState', (state) => {
    setGame((game) => {return Object.assign(new Game(), game, state)})
  })

  useAddSocketListener('updateSetting', (change) => {
    setGame((game) => {return Object.assign(new Game(), game, {[change.setting]: change.option})})
  })

  useAddSocketListener('startGame', () => {
    // Server tells client the game has started with the given settings
    setGame((game) => {
      const newGame = Object.assign(new Game(), game)
      newGame.startGame();
      return newGame
    })
    setTimerTop((timerTop) => {
      const newTimerTop = Object.assign(new Timer(), timerTop)
      newTimerTop.restart(undefined, game.roundTime * 1000);
      return newTimerTop
    })
    setTimerBottom((timerBottom) => {
      return Object.assign(new Timer(), timerBottom, {delay: game.timeAfterGuess * 1000})
    })
  })


  // Server tells us what the current topic is (should only happen if we are the drawer now)
  useAddSocketListener('topic', (t) => { setTopic(t)})

  useAddSocketListener('updateTime', (serverTimers) => {
    // After the requestState, we get the time left and pausedness of both timers
    setTimerTop((timerTop) => {
      const newTimerTop = new Timer()
      if (serverTimers.timerTop.paused) {
        newTimerTop.delay = serverTimers.timerTop.delay;
      } else {
        newTimerTop.restart(undefined, serverTimers.timerTop.delay);
      }
      return newTimerTop
    })

    setTimerBottom((timerBottom) => {
      const newTimerBottom = new Timer()
      if (serverTimers.timerBot.paused) {
        newTimerBottom.delay = serverTimers.timerBot.delay;
      } else {
        newTimerBottom.restart(undefined, serverTimers.timerBot.delay);
      }
      return newTimerBottom
    })
  })

  useAddSocketListener('switchTimer', () => {
    // First guess has been made, so switch timer to countdown the second one
    setTimerTop((timerTop) => {
      const newTimerTop = Object.assign(new Timer(), timerTop)
      newTimerTop.pause()
      return newTimerTop
    })
    setTimerBottom((timerBottom) => {
      const newTimerBottom = Object.assign(new Timer(), timerBottom)
      newTimerBottom.start()
      return newTimerBottom
    })
  })

  useAddSocketListener('advanceRound', () => {
    // A round has finished
    setGame((game) => {
      const newGame = Object.assign(new Game(), game)
      newGame.advanceRound()
      return newGame
    })
    setTimerTop((timerTop) => {
      const newTimerTop = Object.assign(new Timer(), timerTop)
      newTimerTop.restart(undefined, game.roundTime * 1000)
      return newTimerTop
    })
    setTimerBottom((timerBottom) => {
      const newTimerBottom = Object.assign(new Timer(), timerBottom)
      newTimerBottom.pause()
      newTimerBottom.delay = game.timeAfterGuess * 1000
      return newTimerBottom
    })
  })

  useAddSocketListener('resetGame', () => {
    // The game has finished and is ready to be restarted
    onClearDrawing()
    setGame((game) => {
      const newGame = Object.assign(new Game(), game)
      newGame.resetGame();
      return newGame
    })
  })

  // Update score when someone guesses correctly
  useAddSocketListener('markCorrectGuess', (username) => {
    setGame((game) => {
      const newGame = Object.assign(new Game(), game)
      newGame.markCorrectGuess(username);
      return newGame
    })
  });

  // Another user has connected or disconnected.
  useAddSocketListener('userConnect', (user) => {
    setGame((game) => {
      const newGame = Object.assign(new Game(), game)
      newGame.addUser(user.username, user.image);
      return newGame
    })
  });
  useAddSocketListener('userDisconnect', (user) => {
    setGame((game) => {
      const newGame = Object.assign(new Game(), game)
      newGame.removeUser(user);
      return newGame
    })
  });
  useAddSocketListener('gameFinished', () => {
    setGame((game) => {return Object.assign(new Game(), game, {finished: true})})
  })

  React.useEffect(() => {
    currentSocket.socket.emit('requestState', roomName)
    return () => {
      currentSocket.socket.emit('leaveRoom')
    }
  }, [roomName])

  // Disable drawing half the time for co-op mode
  const [disableDrawing, setDisableDrawing] = React.useState(false)
  React.useEffect(() => {
    const checkBanDrawing = () => {
      let disable = false
      if (game.numDrawers > 1 && game.userList.length > 1) {
        const drawerIndex = game.getDrawers().indexOf(user.username)

        let timeSinceStart = null;
        let fractionElapsed = null;
        if (timerTop && timerTop.timeStarted && !timerTop.paused) {
          timeSinceStart = Date.now() - timerTop.timeStarted
          fractionElapsed = timeSinceStart / timerTop.delay
        }
        if (timerBottom && timerBottom.timeStarted && !timerBottom.paused) {
          timeSinceStart = Date.now() - timerBottom.timeStarted
          fractionElapsed = timeSinceStart / timerBottom.delay
        }
        if (timeSinceStart) {
          const offset = Math.floor(fractionElapsed * 10) % game.numDrawers
          if (drawerIndex === offset) {
            disable = true
          }
        }
      }
      setDisableDrawing(disable)
    }
    // Every 1 second, check if we should ban drawing based on co-op state
    checkBanDrawing()
    const interval = setInterval(checkBanDrawing, 1000)
    return () => clearInterval(interval)
  }, [game, timerTop, user, setDisableDrawing])
  const canDraw = game.finished || (game.isDrawer(user.username) && !disableDrawing)

  const [drawWidth, setDrawWidth] = React.useState({pen: CanvasSettings.DEFAULT_PEN_WIDTH, eraser: CanvasSettings.DEFAULT_ERASER_WIDTH})
  const [penColour, setPenColour] = React.useState(CanvasSettings.DEFAULT_PEN_COLOUR)
  const [mouseMode, setMouseMode] = React.useState('pen')
  const canvasRef = React.useRef()

  const onClearDrawing = () => {
    const message = { type: 'clear' }
    currentSocket.socket.emit('canvasMessage', message);
    canvasRef.current.clearCanvas()
  };

  return (
    <>
      <section
        className="game-page"
      >
        <div className="left-column">
          <LobbyInformation
            onLeaveRoom={() => {
              setPage({view: 'lobby'})
            }}
            roomName={roomName}
            game={game}
            topicListName={game.topicListName}
          />
          <PlayerList game={game}/>
          <MessageSection canMessage={!(game.isDrawer(user.username) && game.started)}/>
        </div>
        <div className="middle-column">
          {!game.started && (
            <PreGameSettings user={user} game={game} setGame={setGame}/>
          )}
          {game.started && (
            <DrawingSection
              game={game}
              canDraw={canDraw}
              topic={topic}
              user={user}
              timerTop={timerTop}
              timerBottom={timerBottom}
              mouseMode={mouseMode}
              penColour={penColour}
              drawWidth={drawWidth}
              ref={canvasRef}
            />
          )}
        </div>
        <div className="right-column toolbox" disabled={!canDraw}>
          <DrawingTools
            canDraw={canDraw}
            gameFinished={game.finished}
            drawWidth={drawWidth}
            setDrawWidth={setDrawWidth}
            penColour={penColour}
            setPenColour={setPenColour}
            mouseMode={mouseMode}
            setMouseMode={setMouseMode}
            onClearDrawing={onClearDrawing}
          />
        </div>
      </section>
    </>
  )
}

const LobbyInformation = ({game, topicListName, roomName, onLeaveRoom}) => {
  return (
    <div className="lobby-info ui-panel unselectable bg-primary">
      <h4>{roomName}</h4>
      <h5>Topic: {topicListName}</h5>
      <h5>
        Status:&nbsp;
        {!game.started && ('Choosing game settings...')}
        {(game.started && !game.finished) && (`Round ${game.currentRound + 1}/${game.numRounds}`)}
        {game.finished && 'Game finished!'}
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
                  title={username}
                  className="game-profile-image"
                />
              </div>
              <div className="player-names col">
                <div className={game.isDrawer(username) ? 'game-drawer':''}>
                  {game.getHost() === username && (
                    <i
                      title="Host"
                      className="fa fa-star"
                    />
                  )}
                  &nbsp;{username}&nbsp;
                  {game.isDrawer(username) && (<i className="fa fa-pencil-square" />)}
                </div>
              </div>
              <div className="player-score">
                {game.isDrawer(username) && (
                  <div>
                    <strong>{game.users[username].score.toString()}</strong>
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

const MessageSection = ({canMessage}) => {
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
    setMessages((messages) => {
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
      return newMessages
    })
  })

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
                      {message.username}:&nbsp;
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
                disabled={!canMessage}
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
    fetch('/api/topics').then((response) => {
      return response.json()
    }).then((topics) => {
      setGame((game) => {
        if (!game.topicListName) {
          return Object.assign(new Game(), game, {topicListName: topics[0].name})
        }
        return game
      })
      setTopicList(topics)
    })
  }, [game, setGame, topicList, setTopicList])

  const isHost = user.username === game.getHost()

  // Game host updates a setting
  const onChangeSetting = function (setting, option) {
    if (!game.started && isHost) {
      // Send to server so all other players can update this setting
      currentSocket.socket.emit('changeSetting', {setting : setting, option : option});
      setGame((game) => {return Object.assign(new Game(), game, {[setting]: option})})
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
          ['numDrawers', 'numRounds', 'roundTime', 'timeAfterGuess'].map((setting: string) => {
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
    <div className="pregame-group row">
      <div className="col-xs-4 pregame-group-left">
        <div className="pregame-setting-name">
          <span className="unselectable">{settingConfig.settingName}</span>
        </div>
      </div>
      <div className="col-xs-8 pregame-group-right">
        {settingConfig.options.map((option, i) => {
          let displayName;
          if (settingConfig.optionDisplayNames) {
            displayName = settingConfig.optionDisplayNames[i]
          } else {
            displayName = option
          }
          return (
            <div className="btn-group" key={option}>
              {!isHost && (
                <div className={"btn btn-success pregame-button pregame-display-game unselectable" + (chosen === option ? ' active' : '')}>
                  {displayName}
                </div>
              )}
              {isHost && (
                <label
                  className={"btn btn-success pregame-button" + (chosen === option ? ' active' : '')}
                  onClick={() => onChangeSetting(setting, option)}
                  btn-radio="option"
                >
                  {displayName}
                </label>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const DrawingSection = React.forwardRef(({game, topic, user, timerTop, timerBottom, canDraw, mouseMode, penColour, drawWidth}, canvasRef) => {
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
            {(() => {
              if (game.finished) {
                return 'Game over!'
              }
              if (!game.isDrawer(user.username)) {
                return `${toCommaListIs(game.getDrawers())} drawing`
              }

              let drawerText;
              if (game.numDrawers === 1) {
                drawerText = 'You'
              } else {
                const otherDrawerNames = game.getDrawers().filter((u) => u != user.username)
                const allDrawerNames = ['You', ...otherDrawerNames]
                drawerText = toCommaList(allDrawerNames)
              }
              return (<>
                <b>{drawerText} are drawing!</b> Draw "{topic}"
              </>)
            })()}
          </div>
        </div>
      </div>
      {timerTop && (
        <TimerComponent
          color={'lightgreen'}
          secondDrawerColor={'#56d556'}
          gameFinished={game.finished}
          timer={timerTop}
          totalTime={game.roundTime}
          twoSlices={game.numDrawers > 1 && game.userList.length > 1
        }/>
      )}
      {timerBottom && (
        <TimerComponent
          color={'pink'}
          secondDrawerColor={'#cbffc0'}
          gameFinished={game.finished}
          timer={timerBottom}
          totalTime={game.timeAfterGuess}
          twoSlices={game.numDrawers > 1 && game.userList.length > 1}
        />
      )}
      <CanvasElement canDraw={canDraw} mouseMode={mouseMode} penColour={penColour} drawWidth={drawWidth} ref={canvasRef}/>
    </>
  )
})

const TimerComponent = ({gameFinished, color, secondDrawerColor, timer, totalTime, twoSlices}) => {
  const [timeLeft, setTimeLeft] = React.useState(timer.timeLeft())
  const wrapperRef = React.useRef()
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(timer.timeLeft())
    })
    return () => clearInterval(interval)
  }, [timer])
  const timeLeftPercentage = timeLeft / 10 / totalTime
  const style = {width: timeLeftPercentage + '%'}
  if (timer.paused) {
    style.backgroundColor = 'grey'
  } else if (!twoSlices) {
    style.backgroundColor = color
  } else if (!wrapperRef.current) {
    // wrapper isn't rendered yet
    style.backgroundColor = color
  } else {
    // Alternate 10 slices
    const sectionWidth = Math.round(wrapperRef.current.offsetWidth / 10)
    style.background = `repeating-linear-gradient(
      to right,
      ${color},
      ${color} ${sectionWidth}px,
      ${secondDrawerColor} ${sectionWidth}px,
      ${secondDrawerColor} ${sectionWidth*2}px
    )`
  }
  return (
    <div className={'drawing-timer-wrapper' + (gameFinished ? ' game-over': '')} ref={wrapperRef}>
      <div
        className="drawing-timer"
        style={style}
      />
    </div>
  )
}


const DrawingTools = ({mouseMode, setMouseMode, canDraw, drawWidth, setDrawWidth, gameFinished, penColour, setPenColour, onClearDrawing}) => {
  const drawTools = [
    [{type: 'pen', glyph: 'pencil'}, {type: 'eraser', glyph: 'eraser'}]
    //[{type: 'line', glyph: 'arrows-h'}, {type: 'fill', glyph: 'paint-brush'}],
    //[{type: 'circle', glyph: 'circle-thin'}, {type: 'rect', glyph: 'square-o'}]
  ];
  const paletteColours = [
    [{title: 'black', value: 'black'}, {title: 'grey', value: 'grey'}, {title: 'white', value: 'white'}],
    [{title: 'dark brown', value: 'brown'}, {title: 'brown', value: 'chocolate'}, {title: 'pink', value: 'pink'}],
    [{title: 'red', value: 'red'}, {title: 'orange', value: 'orange'}, {title: 'yellow', value: '#ffef00'}],
    [{title: 'purple', value: 'blueviolet'}, {title: 'green', value: 'limegreen'}, {title: 'light green', value: 'greenyellow'}],
    [{title: 'dark blue', value: 'mediumblue'}, {title: 'blue', value: 'dodgerblue'}, {title: 'light blue', value: 'lightskyblue'}]
  ];
  return (
    <>
      <div className="grid">
        {drawTools.map((drawToolRow, i) => {
          return (
            <div className="grid-row" key={i}>
              {drawToolRow.map(({type, glyph}) => {
                return (
                  <div
                    className={'grid-cell draw-tool' + (mouseMode === type ? ' selected' : '')}
                    key={type}
                    title={type}
                    onClick={() => {
                      if (canDraw) {
                        setMouseMode(type)
                      }
                    }}
                  >
                    <div className="draw-tool-content">
                      <i className={`fa fa-${glyph}`} />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      <div>
        <div className="size-triangle" />
        <input
          className="size-slider"
          type="range"
          onChange={(e) => setDrawWidth({...drawWidth, [mouseMode]: e.target.value})}
          value={drawWidth[mouseMode]}
          min={CanvasSettings.MIN_DRAW_WIDTH}
          max={CanvasSettings.MAX_DRAW_WIDTH}
          disabled={!canDraw}
        />
        <p className="unselectable">Size</p>
      </div>
      <div className="grid" style={{ marginBottom: 10 }}>
        {paletteColours.map((paletteRow, i) => {
          return (
            <div className="grid-row" key={i}>
              {paletteRow.map((paletteColour) => {
                return (
                  <div
                    key={paletteColour.title}
                    className={'grid-cell palette-colour' + (penColour === paletteColour.value ? ' selected' : '')}
                    style={{backgroundColor: paletteColour.value}}
                    title={paletteColour.title}
                    onClick={() => {
                      if (canDraw) {
                        setMouseMode('pen')
                        setPenColour(paletteColour.value)
                      }
                    }}
                  />
                )
              })}
            </div>
          )
        })}
        <div style={{ marginBottom: 0, marginTop: 12 }}>
          <button
            className="btn btn-primary clear-canvas"
            disabled={!canDraw || gameFinished}
            onClick={onClearDrawing}
          >
            Clear Canvas
          </button>
        </div>
      </div>
    </>
  )
}
