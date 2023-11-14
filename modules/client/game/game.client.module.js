'use strict';
import ngSanitize from '../../../node_modules/angular-sanitize';
import '../../../node_modules/angular-bootstrap-colorpicker';
import '../../../node_modules/angular-bootstrap-colorpicker/css/colorpicker.css';
import '../../../node_modules/angularjs-scroll-glue';
import {ApplicationConfiguration} from "../core/app/config";

// Use Application configuration module to register a new module
ApplicationConfiguration.registerModule('game', ['luegg.directives', 'colorpicker.module', ngSanitize]);
