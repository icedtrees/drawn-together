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
exports.Header = void 0;
const React = __importStar(require("react"));
require("./css/bootswatch.css");
require("./css/header.css");
const Header = ({ user, page, setPage }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(true);
    return (React.createElement("header", { className: "navbar navbar-fixed-top navbar-inverse" },
        React.createElement("div", { className: "container" },
            React.createElement("div", { className: "navbar-header" },
                React.createElement("button", { className: "navbar-toggle", type: "button", onClick: () => { setIsCollapsed(!isCollapsed); } },
                    React.createElement("span", { className: "icon-bar" }),
                    React.createElement("span", { className: "icon-bar" }),
                    React.createElement("span", { className: "icon-bar" })),
                React.createElement("a", { className: "navbar-brand", onClick: () => {
                        setPage({ view: 'lobby' });
                    } },
                    React.createElement("i", { className: "fa fa-pencil-square-o" }),
                    " Drawn Together")),
            React.createElement("nav", { className: "navbar-collapse" + (isCollapsed ? ' collapse' : ''), role: "navigation" },
                React.createElement(MenuItems, { user: user, page: page, setPage: setPage }),
                React.createElement(AuthHeader, { user: user, page: page, setPage: setPage })))));
};
exports.Header = Header;
const MenuItems = ({ user, page, setPage }) => {
    const headerMenu = [
        {
            title: user ? 'Lobby' : 'Home',
            page: { view: 'lobby' },
        }, {
            title: 'Rules',
            page: { view: 'rules' },
        },
        // Topics page is not implemented yet
        // {
        //   title: 'Topics',
        //   page: {view: 'topics'},
        // },
    ];
    return (React.createElement("ul", { className: "nav navbar-nav" }, headerMenu.map((item) => {
        return (React.createElement("li", { key: item.page.view, className: (item.page.view === page.view) ? 'active' : '' },
            React.createElement("a", { onClick: () => {
                    setPage(item.page);
                } }, item.title)));
    })));
};
const AuthHeader = ({ user, page, setPage }) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);
    // Handle closing dropdown when clicking outside
    React.useEffect(() => {
        const clickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                // Add a delay because otherwise the dropdown closes before there's a chance for React to fire any
                // onclick events. there's probably a better way to do this
                setTimeout(() => setDropdownOpen(false), 100);
            }
        };
        document.addEventListener("mousedown", clickOutside);
        return () => {
            document.removeEventListener("mousedown", clickOutside);
        };
    }, [dropdownRef, setDropdownOpen]);
    if (!user) {
        return null;
    }
    return (React.createElement("ul", { className: "nav navbar-nav navbar-right" },
        React.createElement("li", { className: "dropdown" + (dropdownOpen ? " open" : ""), dropdown: "" },
            React.createElement("a", { className: "dropdown-toggle user-header-dropdown-toggle", "dropdown-toggle": "", onClick: () => setDropdownOpen(!dropdownOpen), ref: dropdownRef, role: "button" },
                React.createElement("img", { src: user.profileImageURL === 'modules/users/client/img/profile/default.png' ? 'modules/client/users/img/profile/default.png' : user.profileImageURL, alt: user.username, className: "header-profile-image" }),
                React.createElement("span", null, user.username),
                React.createElement("b", { className: "caret" })),
            React.createElement("ul", { className: "dropdown-menu", role: "menu" },
                React.createElement("li", { className: "divider" }),
                React.createElement("li", null,
                    React.createElement("a", { href: "/api/auth/signout", target: "_self" }, "Signout"))))));
};
