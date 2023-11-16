'use strict';

// Use Application configuration module to register a new module
import {ApplicationConfiguration} from "./app/config";
import '../../../node_modules/font-awesome/css/font-awesome.css'
import './css/bootswatch.css'
import './css/core.css'

export const coreModule = ApplicationConfiguration.registerModule('core');
export const coreAdminModule = ApplicationConfiguration.registerModule('core.admin', ['core']);
export const coreAdminRoutesModule = ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
