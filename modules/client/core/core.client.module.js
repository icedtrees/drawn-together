'use strict';

// Use Application configuration module to register a new module
import {ApplicationConfiguration} from "./app/config";

ApplicationConfiguration.registerModule('core');
ApplicationConfiguration.registerModule('core.admin', ['core']);
ApplicationConfiguration.registerModule('core.admin.routes', ['ui.router']);
