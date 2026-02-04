"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReactApp = exports.startReact = void 0;
const client_1 = require("react-dom/client");
const React = __importStar(require("react"));
const topics_1 = require("../../topics/topics");
const lobby_1 = require("../../lobby/lobby");
const error_pages_1 = require("../error-pages");
const header_1 = require("../header");
const signin_1 = require("../../users/signin");
const game_1 = require("../../game/game");
const rules_1 = require("../../rules/rules");
const startReact = () => {
    const root = (0, client_1.createRoot)(document.getElementById('react-root'));
    root.render(React.createElement(exports.ReactApp, null));
};
exports.startReact = startReact;
const ReactApp = () => {
    const [page, _setPage] = React.useState(pathToPage(window.location.pathname));
    const [user, setUser] = React.useState(window.user);
    const setPage = (page) => {
        window.history.pushState({ page }, "", pageToPath(page));
        _setPage(page);
    };
    React.useEffect(() => {
        window.history.replaceState({ page }, "", pageToPath(page));
    }, []);
    React.useEffect(() => {
        const goBack = (e) => {
            _setPage(e.state.page);
        };
        window.addEventListener('popstate', goBack);
        return () => { window.removeEventListener('popstate', goBack); };
    }, [setPage]);
    return (React.createElement(React.Fragment, null,
        React.createElement(header_1.Header, { user: user, page: page, setPage: setPage }),
        React.createElement("section", { className: "content" },
            React.createElement(Content, { user: user, page: page, setPage: setPage, setUser: setUser }))));
};
exports.ReactApp = ReactApp;
const Content = ({ page, user, setPage, setUser }) => {
    if (page.view === 'not-found') {
        return (React.createElement(error_pages_1.NotFoundPage, null));
    }
    if (page.view === 'topics') {
        return (React.createElement(topics_1.TopicsPage, { user: user }));
    }
    if (page.view === 'rules') {
        return (React.createElement(rules_1.RulesPage, null));
    }
    if (!user) {
        return (React.createElement(signin_1.SignInPage, { setUser: setUser, setPage: setPage }));
    }
    if (page.view === 'lobby') {
        return (React.createElement(lobby_1.LobbyPage, { user: user, setPage: setPage }));
    }
    if (page.view === 'game') {
        return (React.createElement(game_1.GamePage, { user: user, roomName: page.roomName, setPage: setPage }));
    }
    return null;
};
const pathToPage = (path) => {
    const gameMatch = /^\/game\/(.*)/i.exec(path);
    if (gameMatch) {
        return { view: 'game', roomName: gameMatch[1] };
    }
    else if (/^\/$/i.test(path)) {
        return { view: 'lobby' };
    }
    else if (/^\/rules$/i.test(path)) {
        return { view: 'rules' };
    }
    else if (/^\/topics$/i.test(path)) {
        return { view: 'topics' };
    }
    else {
        return { view: 'not-found' };
    }
};
const pageToPath = (page) => {
    if (page.view === 'game') {
        return `/game/${page.roomName}`;
    }
    else if (page.view === 'lobby') {
        return '/';
    }
    else if (page.view === 'rules') {
        return '/rules';
    }
    else if (page.view === 'topics') {
        return '/topics';
    }
    else if (page.view === 'not-found') {
        return window.location.pathname;
    }
    else {
        throw Error('Invalid page');
    }
};
(0, exports.startReact)();
