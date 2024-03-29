import * as React from 'react'
import './css/rules.css'

export const RulesPage = () => {
  return (
    <>
      {/* The rules view */}
      <section className="container">
        <div className="row">
          <div className="col-xs-2">
            <div className="rules-nav">
              <h1>Rules</h1>
              <ul className="nav nav-pills nav-stacked">
                <li>
                  <a href="/rules#lobby-and-rooms">Lobby and Rooms</a>
                </li>
                <li>
                  <a href="/rules#game-settings">Game Settings</a>
                </li>
                <li>
                  <a href="/rules#game-basics">Game Basics</a>
                </li>
                <li>
                  <a href="/rules#drawing-basics">Drawing Basics</a>
                </li>
                <li>
                  <a href="/rules#guessing-basics">Guessing Basics</a>
                </li>
                <li>
                  <a href="/rules#using-the-toolbox">Using the Toolbox</a>
                </li>
                {/*<li><a href="#custom-settings">Custom Settings</a></li>*/}
              </ul>
            </div>
          </div>
          <div className="col-xs-10">
            <div id="lobby-and-rooms" className="col-md-12 rules-anchor">
              <h1>Lobby and Rooms</h1>
              <div className="thumbnail">
                <div className="caption">
                  <blockquote>
                    <b>The lobby has a list of rooms.</b> A separate game is held in
                    each room.
                  </blockquote>
                </div>
              </div>
            </div>
            <div id="game-settings" className="col-md-12 rules-anchor">
              <h1>Game Settings</h1>
              <div className="thumbnail">
                <div className="caption">
                  <blockquote>
                    <p>
                      <b>The host has 5 settings </b> to pick before the game
                      starts.
                    </p>
                  </blockquote>
                  <ul className="media-list">
                    <li className="media">
                      <div className="media-left"></div>
                      <div className="media-body">
                        <h4 className="media-heading">The topic.</h4>
                        <b>This is the theme of the prompts.</b>
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left"></div>
                      <div className="media-body">
                        <h4 className="media-heading">The difficulty.</h4>
                        <b>
                          This sets how difficult the prompts will be to draw and
                          guess.
                        </b>{" "}
                        The random option will select prompts from all of the
                        difficulties.
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left"></div>
                      <div className="media-body">
                        <h4 className="media-heading">The number of rounds.</h4>
                        <b>The number of rounds before the game ends.</b>
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left"></div>
                      <div className="media-body">
                        <h4 className="media-heading">The drawing timer.</h4>
                        <b>This sets how much time the drawer gets to draw. </b> If
                        no one guesses their drawing during this time, the round
                        will end.
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left"></div>
                      <div className="media-body">
                        <h4 className="media-heading">The reserve timer.</h4>
                        <b>
                          when the first person correctly guesses the prompt, the
                          timer will swap to reserve time.
                        </b>{" "}
                        The rest of the guessers have this much time to guess before
                        the round ends.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div id="game-basics" className="col-md-12 rules-anchor">
              <h1>Game Basics</h1>
              <div className="thumbnail">
                <img
                  src="modules/client/rules/img/round.png"
                  alt="The round number is displayed above the canvas."
                />
                <div className="caption">
                  <blockquote>
                    <b>Each game is made up of a number of rounds.</b> Each round
                    has a drawer.
                  </blockquote>
                  The current round and current drawer are displayed in the middle
                  column of the game page.
                </div>
              </div>
              <div className="thumbnail">
                <img
                  src="modules/client/rules/img/players.png"
                  alt="In this room there are 3 players: 1 drawer and 2 guessers."
                />
                <div className="caption">
                  <blockquote>
                    The player list shows the usernames and points of all the
                    players in the room.
                    <b>
                      After the last round, the player with the most points wins!
                    </b>
                  </blockquote>
                  In the player list, the drawer's username is bolded.<sup>1</sup>{" "}
                  All other players in the room are guessers. If a guesser makes a
                  correct guess a tick will show up to the left of their score.
                  <sup>2</sup>
                  The drawer changes each round according to the order in the player
                  list. The player list also shows the number of points each user
                  has to the right of their username. The current and maximum number
                  of players is displayed at the top of the player list.
                </div>
              </div>
            </div>
            <div id="drawing-basics" className="col-md-12 rules-anchor">
              <h1>Drawing Basics</h1>
              <div className="thumbnail">
                <img
                  src="modules/client/rules/img/drawer.png"
                  alt="The drawer tries to draw a drain on the canvas."
                />
                <div className="caption">
                  <blockquote>
                    <p>
                      <b>
                        The drawer will be given a prompt that only they can see
                        <sup>1</sup>
                      </b>
                      , and have a set time to draw the prompt on the canvas. If no
                      one guesses their drawing during this time, the round will
                      end.<sup>2</sup>
                    </p>
                  </blockquote>
                  Drawers are not allowed to write letters or numbers. In general,
                  drawers should just draw the prompt instead of trying to get
                  around restrictions. However, it is acceptable to split compound
                  words into individual words. For example when given the prompt
                  "paper boat", one could draw paper, a plus sign, and a boat.
                  Ultimately, the rules are enforced by the room host rather than
                  the game. If players disagree with the rules of the host, they are
                  encouraged to host their own room.
                </div>
              </div>
            </div>
            <div id="guessing-basics" className="col-md-12 rules-anchor">
              <h1>Guessing Basics</h1>
              <div className="thumbnail">
                <img
                  src="modules/client/rules/img/timer.png"
                  alt="The second timer goes to red after the first person guesses correctly."
                />
                <div className="caption">
                  <blockquote>
                    <p>
                      <b>
                        After the first user guesses correctly, all the other
                        guessers must guess in a set time before the round ends.
                      </b>{" "}
                      The top timer will stop and the bottom one will start.
                    </p>
                  </blockquote>
                </div>
              </div>
              <div className="thumbnail">
                <img src="modules/client/rules/img/guess.png" />
                <div className="caption">
                  <blockquote>
                    <p>
                      <b>Guessers can make guesses in the guess box</b> while the
                      drawer is drawing.
                    </p>
                  </blockquote>
                  All players can see what the guesses are, unless a guess is close
                  to the prompt. If the guess is close to the prompt, the person who
                  made that guess will be notified that they are close, and their
                  guess only visible to them and the drawer. When the prompt is
                  guessed correctly, the drawer and the person who guessed correctly
                  will each get N-1 points, where N is the number of players in the
                  room. If there the remaining time of the round was greater than 20
                  seconds, it will be reduced to 20 seconds. The drawer will receive
                  an additional point for each guesser who guesses correctly after
                  the first, and those guessers will receive one point less than the
                  person who guessed correctly before them.
                  <br />
                  Drawers can pass the round if they do not wish to draw. This
                  cannot be used if someone has already guessed the prompt.
                </div>
              </div>
            </div>
            <div id="using-the-toolbox" className="col-md-12 rules-anchor">
              <h1>Using the Toolbox</h1>
              <div className="thumbnail">
                <img src="modules/client/rules/img/toolbox.png" />
                <div className="caption">
                  <blockquote>
                    <p>
                      <b>The drawer has 5 different types of tools</b> at their
                      disposal.
                    </p>
                  </blockquote>
                  <ul className="media-list">
                    <li className="media">
                      <div className="media-left">
                        <img
                          className="media-object"
                          src="modules/client/rules/img/toolbox1.png"
                          alt="The brush and eraser tool."
                        />
                      </div>
                      <div className="media-body">
                        <h4 className="media-heading">
                          The brush and eraser tool.
                        </h4>
                        <b>
                          You can switch between the brush and the eraser tool using
                          these buttons.
                        </b>
                        The brush tool lets you draw on the canvas and the eraser
                        tool lets you remove parts of your drawing.
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left">
                        <img
                          className="media-object"
                          src="modules/client/rules/img/toolbox2.png"
                          alt="The size slider."
                        />
                      </div>
                      <div className="media-body">
                        <h4 className="media-heading">The size slider.</h4>
                        <b>
                          The size slider lets you choose the size of your brush or
                          eraser.
                        </b>{" "}
                        Moving the slider to the left makes your tool smaller
                        whereas moving it to the right makes it larger.
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left">
                        <img
                          className="media-object"
                          src="modules/client/rules/img/toolbox3.png"
                          alt="The colour palette."
                        />
                      </div>
                      <div className="media-body">
                        <h4 className="media-heading">The colour palette.</h4>
                        <b>
                          The colour palette gives you 15 different colours to paint
                          with.
                        </b>{" "}
                        If you hover over each colour, a tooltip will pop up telling
                        you the name of the colour you're hovering over.
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left">
                        <img
                          className="media-object"
                          src="modules/client/rules/img/toolbox4.png"
                          alt="The custom colour tool."
                        />
                      </div>
                      <div className="media-body">
                        <h4 className="media-heading">The custom colour tool.</h4>
                        <b>
                          The custom colour tool lets you choose your own colour!
                        </b>{" "}
                        Click on the custom colour button to bring up the colour
                        selection pop up.
                      </div>
                    </li>
                    <li className="media">
                      <div className="media-left">
                        <img
                          className="media-object"
                          src="modules/client/rules/img/toolbox5.png"
                          alt="The clear canvas button."
                        />
                      </div>
                      <div className="media-body">
                        <h4 className="media-heading">The clear canvas button.</h4>
                        <b>This button lets you clear the entire canvas.</b>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            {/*<div id="custom-settings" class="col-md-12 rules-anchor">*/}
            {/*<h1>Custom Settings</h1>*/}
            {/*At the start of a game, hosts can choose:*/}
            {/*<ol>*/}
            {/*<li> the number of rounds</li>*/}
            {/*<li> the length of each round</li>*/}
            {/*<li> the remaining length of a round after the prompt is first guessed correctly</li>*/}
            {/*</ol>*/}
            {/*</div>*/}
            {/*<h3> Custom Game Modes </h3>*/}
            {/*<list>*/}
            {/*<li><b>Co-op mode:</b> Prompts are drawn by teams, whose members are given alternating time slices to contribute to the drawing.</li>*/}
            {/*<li><b>VIM mode:</b> The drawer can only draw using keyboard commands. </li>&ndash;&gt;*/}
            {/*</list>*/}
          </div>
        </div>
      </section>
    </>
  )
}
