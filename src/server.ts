/**
 * This is the server entrypoint.
 *
 * It is built by the esbuild.config.mjs build script.
 *
 * This file is in src/ just to make it at the same directory level as build/ so that the relative path import
 * works after building.
 */
import * as app from '../config/lib/app';

app.start();
