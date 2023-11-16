'use strict';

// Use Application configuration module to register a new module
import {ApplicationConfiguration} from "../core/app/config";
import './css/users.css'

export const usersModule = ApplicationConfiguration.registerModule('users', ['core']);
export const usersAdminModule = ApplicationConfiguration.registerModule('users.admin', ['core.admin']);
export const usersAdminRoutesModule = ApplicationConfiguration.registerModule('users.admin.routes', ['core.admin.routes']);
