import {createRoot} from '../../../../node_modules/react-dom/client'
import * as React from '../../../../node_modules/react'
import {TopicsPage} from "../../topics/topics";
import {LobbyPage} from "../../lobby/lobby";
import {ForbiddenPage, NotFoundPage} from "../error-pages";
import {ReactGlobalState} from "./react-global-state";

type Page = 'topics' | 'lobby' | 'not-found' | 'bad-request' | 'forbidden'

export const startReact = () => {
  const root = createRoot(document.getElementById('react-root'))
  root.render(<ReactApp/>)
}

export const ReactApp = () => {
  const [page, setPage] = React.useState<Page>(null)
  const [user, setUser] = React.useState(null)
  React.useEffect(() => {
    ReactGlobalState.setCurrentPage = (p) => setPage(p)
  }, [setPage])
  React.useEffect(() => {
    ReactGlobalState.setCurrentUser = (p) => setUser(p)
  }, [setUser])
  if (page === 'not-found') {
    return (<NotFoundPage/>)
  }
  if (page === 'forbidden') {
    return (<ForbiddenPage/>)
  }
  if (page === 'topics') {
    return (<TopicsPage user={user}/>)
  }
  if (!user) {
    // Render sign-in page?
    return null
  }
  if (page === 'lobby') {
    return (<LobbyPage user={user} setPage={setPage}/>)
  }
  return null
}

startReact()
