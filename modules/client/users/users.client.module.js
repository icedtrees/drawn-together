'use strict';

// Use Application configuration module to register a new module
import {ApplicationConfiguration} from "../core/app/config";

ApplicationConfiguration.registerModule('users', ['core']);
ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);
