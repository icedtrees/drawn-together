import {createRoot} from 'react-dom/client'
import * as React from 'react'
import {TopicsPage} from "../../topics/topics";
import {LobbyPage} from "../../lobby/lobby";
import {ForbiddenPage, NotFoundPage} from "../error-pages";
import {ReactGlobalState} from "./react-global-state";
import {Header} from "../header";
import {SignInPage} from "../../users/signin";
import {GamePage} from "../../game/game";

type Page = 'topics' | 'home' | 'not-found' | 'bad-request' | 'forbidden'

export const startReact = () => {
  const root = createRoot(document.getElementById('react-root'))
  root.render(<ReactApp/>)
}

export const ReactApp = () => {
  const [page, setPage] = React.useState<Page>(null)
  const [user, setUser] = React.useState(null)
  React.useEffect(() => {
    ReactGlobalState.setCurrentPage = (p) => {
      setPage(p)
    }
    return () => ReactGlobalState.setCurrentPage = null
  }, [setPage])
  React.useEffect(() => {
    ReactGlobalState.setCurrentUser = (p) => setUser(p)
    return () => ReactGlobalState.setCurrentUser = null
  }, [setUser])
  return (
    <>
      <Header user={user} page={page} setPage={setPage}/>
      <section className={"content"}>
        <Content user={user} page={page} setPage={setPage} setUser={setUser}/>
      </section>
    </>
  )
};

const Content = ({page, user, setPage, setUser}) => {
  const roomNameFromURL = window.location.pathname.split('/')[2]
  const [roomName, setRoomName] = React.useState(roomNameFromURL)

  if (page === 'not-found') {
    return (<NotFoundPage/>)
  }
  if (page === 'forbidden') {
    return (<ForbiddenPage/>)
  }
  if (page === 'topics') {
    return (<TopicsPage user={user}/>)
  }
  if (page === 'rules') {
    // Not implemented yet
    return null
  }
  if (!user) {
    return (<SignInPage setUser={setUser} setPage={setPage}/>)
  }
  if (page === 'home' || page === 'lobby') {
    return (<LobbyPage user={user} setPage={setPage} setRoomName={setRoomName}/>)
  }
  if (page === 'game') {
    return (<GamePage
      user={user}
      roomName={roomName}
      setPage={setPage}
      setRoomName={setRoomName}
    />)
  }
  return null
}

startReact()
