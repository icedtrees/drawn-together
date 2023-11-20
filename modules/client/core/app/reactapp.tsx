import { createRoot } from '../../../../node_modules/react-dom/client'
import * as React from '../../../../node_modules/react'
import {TopicsPage} from "../../topics/topics";
import {LobbyPage} from "../../lobby/lobby";

export const startReact = () => {
  const root = createRoot(document.getElementById('react-root'))
  root.render(<ReactApp/>)
}

// These are temporary hacks to update React state from angular code until we fully migrate off Angular
export let setCurrentPage = null
export let setCurrentUser = null

export const ReactApp = () => {
  const [page, setPage] = React.useState<null>(null)
  const [user, setUser] = React.useState(null)
  setCurrentPage = (p) => setPage(p)
  setCurrentUser = (u) => setUser(u)
  if (page === 'topics') {
    return (<TopicsPage user={user}/>)
  }
  if (!user) {
    // Render sign-in page?
    return null
  }
  if (page === 'lobby') {
    return (<LobbyPage user={user} setCurrentPage={setCurrentPage}/>)
  }
  return null
}

startReact()
