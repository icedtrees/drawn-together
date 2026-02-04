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
exports.SignInPage = void 0;
const React = __importStar(require("react"));
require("./css/users.css");
const SignInPage = ({ setPage, setUser }) => {
    // Get an eventual error defined in the URL query string:
    const [error, setError] = React.useState(null);
    const [username, setUsername] = React.useState('');
    const onSignIn = function (e) {
        e.preventDefault(); // Prevent page reload caused by form submit
        if (username.trim().length < 1) {
            setError("Username is required.");
            return;
        }
        fetch('/api/auth/signin', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        }).then((response) => {
            if (!response.ok) {
                response.json().then((error) => {
                    setError(error.message);
                });
                return Promise.reject();
            }
            return response.json();
        }).then((user) => {
            setUser(user);
            setTimeout(() => { setPage({ view: 'lobby' }); });
        });
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("section", { className: "row", style: { width: "100%" } },
            React.createElement("div", { className: "col-xs-12 col-sm-offset-3 col-sm-6 col-md-offset-1 col-md-5 text-left" },
                React.createElement("div", { className: "description-text" },
                    React.createElement("p", null, "Play online pictionary with your friends! Each person will take turns drawing a word which everyone else tries to guess in the time limit. The person with the most points wins."),
                    React.createElement("p", null, "You can choose your own game settings and enter your own custom word lists!"),
                    React.createElement("p", null, "Be drawn together by the fun!")),
                React.createElement("img", { className: "img-thumbnail", src: "modules/client/game/img/demo.png" })),
            React.createElement("div", { className: "col-xs-12 col-sm-offset-3 col-sm-6 col-md-offset-1 col-md-5 text-center" },
                React.createElement("div", null,
                    React.createElement("div", { className: "col-md-offset-1 col-md-7" },
                        React.createElement("h3", null, "Let's play!"),
                        React.createElement("form", { name: "userForm", onSubmit: onSignIn, className: "signin", noValidate: "", autoComplete: "off" },
                            React.createElement("fieldset", null,
                                React.createElement("div", { className: "form-group" + (error ? ' has-error' : '') },
                                    React.createElement("label", { htmlFor: "username" }, "Username"),
                                    React.createElement("input", { type: "text", id: "username", name: "username", className: "form-control", placeholder: "Username", required: "", onChange: (e) => {
                                            setUsername(e.target.value);
                                            setError(null);
                                        }, value: username }),
                                    React.createElement("div", { role: "alert" },
                                        React.createElement("p", { className: "help-block" },
                                            React.createElement("span", null, error)))),
                                React.createElement("div", { className: "text-center form-group" },
                                    React.createElement("button", { type: "submit", className: "btn btn-primary" }, "Play"))))))))));
};
exports.SignInPage = SignInPage;
