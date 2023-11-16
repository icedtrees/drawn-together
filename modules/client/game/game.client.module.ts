'use strict';
import ngSanitize from '../../../node_modules/angular-sanitize';
import '../../../node_modules/angular-bootstrap-colorpicker';
import '../../../node_modules/angular-bootstrap-colorpicker/css/colorpicker.css';
import '../../../node_modules/angularjs-scroll-glue';
import '../../../node_modules/font-awesome/css/font-awesome.css'

import {ApplicationConfiguration} from "../core/app/config";

import './css/chat.css'
import './css/drawing.css'
import './css/game-shared.css'
import './css/game.css'
import './css/lobby-info.css'
import './css/player-list.css'
import './css/pregame.css'
import './css/range-slider.css'
import './css/toolbox.css'

// Use Application configuration module to register a new module
export const gameModule = ApplicationConfiguration.registerModule('game', ['luegg.directives', 'colorpicker.module', ngSanitize]);
