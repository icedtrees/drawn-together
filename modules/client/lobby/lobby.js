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
exports.LobbyPage = void 0;
const React = __importStar(require("react"));
const socket_io_client_service_1 = require("../core/services/socket.io.client.service");
require("./css/lobby.css");
const GameSettings = __importStar(require("../../shared/game/config/game.shared.game.config"));
const LobbyPage = ({ user, setPage }) => {
    const [rooms, setRooms] = React.useState([]);
    const [newRoomName, setNewRoomName] = React.useState('');
    const [error, setError] = React.useState();
    const roomNameRef = React.useRef(null);
    React.useEffect(() => {
        (0, socket_io_client_service_1.connectSocket)(user);
        socket_io_client_service_1.currentSocket.socket.emit('requestRooms');
    }, [user]);
    (0, socket_io_client_service_1.useAddSocketListener)('changeRoom', (room) => {
        // Receive room update from server
        for (let i = 0; i < rooms.length; i++) {
            if (rooms[i].name === room.name) {
                if (room.numPlayers > 0) {
                    const newRooms = [...rooms];
                    newRooms[i] = room;
                    setRooms(newRooms);
                }
                else {
                    setRooms(rooms.filter((r) => r.name !== room.name));
                }
                return;
            }
        }
        if (room.numPlayers > 0) {
            setRooms([...rooms, room]);
        }
    });
    (0, socket_io_client_service_1.useAddSocketListener)('requestRooms', (r) => setRooms(r));
    (0, socket_io_client_service_1.useAddSocketListener)('validRoomName', (roomName) => {
        setPage({ view: 'game', roomName });
    });
    (0, socket_io_client_service_1.useAddSocketListener)('invalidRoomName', (error) => { setError(error); });
    const joinRoom = (roomName) => {
        setPage({ view: 'game', roomName });
    };
    const createRoom = () => {
        if (newRoomName === '') {
            setError('Room name cannot be empty');
        }
        else {
            socket_io_client_service_1.currentSocket.socket.emit('checkRoomName', newRoomName);
        }
    };
    return (React.createElement("section", { className: "container" },
        React.createElement("div", { className: "col-xs-12 col-sm-12 col-md-8" },
            React.createElement("h2", null, "Lobby"),
            React.createElement("table", { className: "table table-striped table-responsive" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null, "Room"),
                        React.createElement("th", null, "Host"),
                        React.createElement("th", null, "Topic"),
                        React.createElement("th", null, "Players"),
                        React.createElement("th", null))),
                React.createElement("tbody", null,
                    rooms.length === 0 &&
                        React.createElement("tr", { className: "room-listing" },
                            React.createElement("td", null, "There aren't any rooms open. Create your own!"),
                            React.createElement("td", null),
                            React.createElement("td", null),
                            React.createElement("td", null),
                            React.createElement("td", null)),
                    rooms.map((room) => {
                        return (React.createElement("tr", { className: "room-listing", key: room.name },
                            React.createElement("td", null,
                                React.createElement("span", null, room.name)),
                            React.createElement("td", null,
                                React.createElement("span", null, room.host)),
                            React.createElement("td", null,
                                React.createElement("span", null, room.topic)),
                            React.createElement("td", null,
                                React.createElement("span", null, room.numPlayers),
                                " /",
                                " ",
                                React.createElement("span", null, room.maxNumPlayers)),
                            React.createElement("td", null,
                                React.createElement("button", { className: "btn btn-primary btn-sm btn-block", onClick: () => joinRoom(room.name), value: "Join" }, "Join"))));
                    })))),
        React.createElement("div", { className: "col-xs-12 col-sm-12 col-md-4" },
            React.createElement("h2", { id: "create-room" }, "Create Room"),
            React.createElement("div", { className: "form-group" },
                React.createElement("label", { htmlFor: "roomName" }, "Room Name"),
                React.createElement("input", { autoComplete: "off", type: "text", id: "roomName", name: "roomName", className: "form-control", maxLength: GameSettings.MAX_ROOM_NAME_LENGTH, placeholder: "Room Name", ref: roomNameRef, onChange: (e) => {
                        setError('');
                        setNewRoomName(e.target.value);
                    }, value: newRoomName })),
            React.createElement("button", { onClick: createRoom, value: "Create Room", className: "btn btn-primary" }, "Create Room"),
            React.createElement("div", null,
                React.createElement("span", { className: "error-message" }, error)))));
};
exports.LobbyPage = LobbyPage;
