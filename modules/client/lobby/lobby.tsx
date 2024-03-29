import * as React from 'react'
import {connectSocket, currentSocket, useAddSocketListener} from "../core/services/socket.io.client.service";
import './css/lobby.css'
import * as GameSettings from '../../shared/game/config/game.shared.game.config'

export const LobbyPage = ({user, setPage}) => {
  const [rooms, setRooms] = React.useState([])
  const [newRoomName, setNewRoomName] = React.useState('')
  const [error, setError] = React.useState()
  const roomNameRef = React.useRef(null)
  React.useEffect(() => {
    connectSocket(user)
    currentSocket.socket.emit('requestRooms')
  }, [user])

  useAddSocketListener('changeRoom', (room) => {
    // Receive room update from server
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].name === room.name) {
        if (room.numPlayers > 0) {
          const newRooms = [...rooms]
          newRooms[i] = room;
          setRooms(newRooms)
        } else {
          setRooms(rooms.filter((r) => r.name !== room.name))
        }
        return;
      }
    }
    if (room.numPlayers > 0) {
      setRooms([...rooms, room])
    }
  })
  useAddSocketListener('requestRooms', (r) => setRooms(r))
  useAddSocketListener('validRoomName', (roomName) => {
    setPage({view: 'game', roomName})
  })
  useAddSocketListener('invalidRoomName', (error) => { setError(error) })

  const joinRoom = (roomName) => {
    setPage({view: 'game', roomName})
  };
  const createRoom = () => {
    if (newRoomName === '') {
      setError('Room name cannot be empty');
    } else {
      currentSocket.socket.emit('checkRoomName', newRoomName);
    }
  };

  return (
    <section className="container">
      <div className="col-xs-12 col-sm-12 col-md-8">
        <h2>Lobby</h2>
        <table className="table table-striped table-responsive">
          <thead>
          <tr>
            <th>Room</th>
            <th>Host</th>
            <th>Topic</th>
            <th>Players</th>
            <th />
          </tr>
          </thead>
          <tbody>
          {rooms.length === 0 &&
            <tr className="room-listing">
              <td>
                There aren't any rooms open. Create your own!
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>
          }
          {rooms.map((room) => {
            return (
              <tr className="room-listing" key={room.name}>
                <td>
                  <span>{room.name}</span>
                </td>
                <td>
                  <span>{room.host}</span>
                </td>
                <td>
                  <span>{room.topic}</span>
                </td>
                <td>
                  <span>{room.numPlayers}</span> /{" "}
                  <span>{room.maxNumPlayers}</span>
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm btn-block"
                    onClick={() => joinRoom(room.name)}
                    value="Join"
                  >
                    Join
                  </button>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>
      <div className="col-xs-12 col-sm-12 col-md-4">
        <h2 id="create-room">Create Room</h2>
        <div className="form-group">
          <label htmlFor="roomName">Room Name</label>
          <input
            autoComplete="off"
            type="text"
            id="roomName"
            name="roomName"
            className="form-control"
            maxLength={GameSettings.MAX_ROOM_NAME_LENGTH}
            placeholder="Room Name"
            ref={roomNameRef}
            onChange={(e) => {
              setError('')
              setNewRoomName(e.target.value)
            }}
            value={newRoomName}
          />
        </div>
        <button onClick={createRoom} value="Create Room" className="btn btn-primary">
          Create Room
        </button>
        <div>
          <span className="error-message">{error}</span>
        </div>
      </div>
    </section>
  )
}
