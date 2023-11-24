import * as React from 'react'
import './css/chat.css'
import './css/drawing.css'
import './css/game-shared.css'
import './css/game.css'
import './css/lobby-info.css'
import './css/player-list.css'
import './css/pregame.css'
import './css/range-slider.css'
import './css/toolbox.css'

export const GamePage = () => {
  const isDrawer = false
  return (
    <>
      <section
        className="game-page"
      >
        <div className="left-column">
          <LobbyInformation/>
          <PlayerList/>
          <MessageSection/>
        </div>
        <div className="middle-column">
          <PreGameSettings/>
          <DrawingSection/>
        </div>
        <div className="right-column" ng-disabled="!toolboxUsable()">
          <DrawingTools/>
        </div>
      </section>
    </>
  )
}

const LobbyInformation = () => {
  return (
    <div className="lobby-info ui-panel unselectable bg-primary">
      <h4>
        <span ng-bind="roomName" />
      </h4>
      <h5>
        Topic: <span ng-bind="Game.topicListName" />
      </h5>
      <button className="btn leave-lobby" ng-click="leaveRoom()">
        <i className="fa fa-sign-out" style={{ paddingRight: 2 }} /> Leave
        Room
      </button>
    </div>
  )
}

const PlayerList = () => {
  return (
    <div className="unselectable">
      <div className="text-center players-header">
        Players (<span ng-bind="Game.userList.length" />
        /16)
      </div>
      <ul className="list-unstyled player-list">
        <li className="row" ng-repeat="user in Game.userList">
          <div className="player-image col">
            <img
              ng-src="{{Game.getUserProfileImage(user)}}"
              title="{{user}}"
              className="game-profile-image"
            />
          </div>
          <div className="player-names col">
            <div ng-class="{'game-drawer': Game.isDrawer(user)}">
              <i
                ng-if="Game.getHost() === user"
                title="Host"
                className="fa fa-star"
              />
              <span ng-bind="user" />
            </div>
          </div>
          <div className="player-score">
            <div ng-if="Game.isDrawer(user)">
              <strong ng-bind="Game.users[user].score.toString()" />
            </div>
            <div ng-if="!Game.isDrawer(user)">
              <span ng-bind="Game.users[user].score.toString()" />
              <i
                ng-if="Game.userHasGuessed(user)"
                title="Guessed the prompt!"
                className="fa fa-check user-guessed"
              />
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}

const MessageSection = () => {
  return (
    <>
      <div
        id="chat-container"
        className="chat-container"
        scroll-glue="{{isIE ? 'false' : ''}}"
      >
        <div className="game-message-box">
          <ul className="list-unstyled">
            {/* List all messages */}
            <li
              className="col-xs-12 col-md-12 game-message wordwrap"
              ng-class="message.class"
              ng-repeat="message in messages"
            >
              <span
                ng-if="message.class !== 'status'"
                ng-bind="message.username + ':'"
                className="username"
              />
              <span
                className="message-text"
                ng-if="message.class !== 'status'"
                ng-bind="message.text"
              />
              <span
                className="message-text"
                ng-if="message.class === 'status'"
                ng-bind-html="message.text"
              />
              <div className="game-message-addon" ng-bind="message.addon" />
            </li>
          </ul>
        </div>
      </div>
      <div className="message-form col-xs-12 col-md-12">
        <form className="col-xs-12 col-md-12" ng-submit="sendMessage()">
          <fieldset className="row">
            <div className="input-group col-xs-12 col-md-12">
              <input
                autoComplete="off"
                ng-disabled="Game.isDrawer(username) && Game.started"
                type="text"
                id="messageText"
                name="messageText"
                className="form-control message-input"
                ng-model="messageText"
                ng-trim="false"
                maxLength="{{ChatSettings.MAX_MSG_LEN}}"
                placeholder="Enter new message"
              />
            </div>
          </fieldset>
        </form>
      </div>
    </>
  )
}

const PreGameSettings = () => {
  return (
    <div
      id="settings"
      className="col"
      style={{ display: "none", height: "100%", textAlign: "center" }}
    >
      <div className="drawing-header-pregame unselectable">
        <span ng-bind="username === Game.getHost() ? 'You are' : Game.getHost() + ' is'" />{" "}
        choosing the game settings...
      </div>
      <div
        className="settings-body"
        ng-class="{'non-host': Game.getHost() !== username}"
      >
        <div className="pregame-group row">
          <div className="col-xs-4 pregame-group-left">
            <div className="pregame-setting-name">
              <span className="unselectable">Topic</span>
            </div>
          </div>
          <div className="col-xs-8 pregame-group-right">
            <select
              id="topic-selector"
              className="form-control"
              ng-if="username === Game.getHost()"
              ng-model="chosenSettings['topicListName']"
            >
              <option ng-repeat="topicData in listOfTopics">
                {"{"}
                {"{"}topicData.name{"}"}
                {"}"}
              </option>
            </select>
            <div
              ng-if="Game.getHost() !== username"
              ng-bind="chosenSettings['topicListName']"
              className="btn btn-warning pregame-button pregame-display-topic unselectable active"
            ></div>
          </div>
        </div>
        <div style={{ height: "2em" }} />
        <div
          className="pregame-group row"
          ng-repeat="setting in Utils.keys(GameSettings)"
          ng-init="value = GameSettings[setting]"
          ng-if="GameSettings[setting].settingName"
        >
          <div className="col-xs-4 pregame-group-left">
            <div className="pregame-setting-name">
              <span ng-bind="value.settingName" className="unselectable" />
            </div>
          </div>
          <div className="col-xs-8 pregame-group-right">
            <div className="btn-group" ng-repeat="option in value.options">
              <div
                ng-if="Game.getHost() !== username"
                ng-bind="option"
                ng-class="{'active': chosenSettings[setting] === option}"
                className="btn btn-success pregame-button pregame-display-game unselectable"
              ></div>
              <label
                ng-if="Game.getHost() === username"
                ng-model="chosenSettings[setting]"
                ng-bind="option"
                className="btn btn-success pregame-button"
                ng-click="changeSetting(setting, option)"
                btn-radio="option"
              ></label>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-12 start-game-div">
        <button
          className="btn btn-primary"
          ng-hide="Game.getHost() !== username"
          ng-click="startGame()"
        >
          Start Game
        </button>
      </div>
    </div>

  )
}

const DrawingSection  = () => {
  return (
    <>
      <div className="drawing-header">
        <div className="drawing-header-buttons">
          <button
            className="btn btn-primary vertical-center"
            ng-disabled="!Game.isDrawer(username) || Game.correctGuesses !== 0"
            ng-click="finishDrawing()"
          >
            <i className="fa fa-hourglass-end" style={{ paddingRight: 4 }} />{" "}
            Pass
          </button>
        </div>
        <div className="drawing-header-text vertical-center">
          <div className="text-center unselectable">
            <span
              ng-if="Game.currentRound !== undefined && Game.numRounds !== undefined"
              ng-bind="Game.finished ? 'Game over!' : 'Round ' + (Game.currentRound + 1) + '/' + Game.numRounds+ ':'"
            />
            <span
              ng-if="Game.getDrawers().length"
              ng-bind="Game.isDrawer(username) ? 'Draw &quot;' + topic + '&quot;' : Utils.toCommaListIs(Game.getDrawers()) + ' drawing'"
            />
          </div>
        </div>
      </div>
      <div ng-class="{'drawing-timer-wrapper': true, 'game-over': Game.finished}">
        <div
          className="drawing-timer"
          ng-style="{'background-color': timerTop.paused ? 'grey' : 'lightgreen', 'width': timerTopLeft / 10 / Game.roundTime + '%'}"
        />
      </div>
      <div ng-class="{'drawing-timer-wrapper': true, 'game-over': Game.finished}">
        <div
          className="drawing-timer"
          ng-style="{'background-color': timerBot.paused ? 'grey' : 'pink', 'width': timerBotLeft / 10 / Game.timeAfterGuess + '%'}"
        />
      </div>
      <div id="drawing-canvas" className="dt-drawing" />
    </>
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