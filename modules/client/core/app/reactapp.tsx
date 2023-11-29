import {createRoot} from 'react-dom/client'
import * as React from 'react'
import {TopicsPage} from "../../topics/topics";
import {LobbyPage} from "../../lobby/lobby";
import {NotFoundPage} from "../error-pages";
import {Header} from "../header";
import {SignInPage} from "../../users/signin";
import {GamePage} from "../../game/game";
import {RulesPage} from "../../rules/rules";

export type Page =
  | {view: 'topics'}
  | {view: 'not-found'}
  | {view: 'rules'}
  | {view: 'lobby'}
  | {view: 'game', roomName: string}

export const startReact = () => {
  const root = createRoot(document.getElementById('react-root'))
  root.render(<ReactApp/>)
}

export const ReactApp = () => {
  const [page, _setPage] = React.useState<Page>(pathToPage(window.location.pathname))
  const [user, setUser] = React.useState(window.user)

  const setPage = (page) => {
    window.history.pushState({page}, "", pageToPath(page))
    _setPage(page)
  }
  React.useEffect(() => {
    window.history.replaceState({page}, "", pageToPath(page))
  }, [])
  React.useEffect(() => {
    const goBack = (e) => {
      _setPage(e.state.page)
    }
    window.addEventListener('popstate', goBack)
    return () => { window.removeEventListener('popstate', goBack) }
  }, [setPage])

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
  if (page.view === 'not-found') {
    return (<NotFoundPage/>)
  }
  if (page.view === 'topics') {
    return (<TopicsPage user={user}/>)
  }
  if (page.view === 'rules') {
    return (<RulesPage/>)
  }
  if (!user) {
    return (<SignInPage setUser={setUser} setPage={setPage}/>)
  }
  if (page.view === 'lobby') {
    return (<LobbyPage user={user} setPage={setPage}/>)
  }
  if (page.view === 'game') {
    return (<GamePage
      user={user}
      roomName={page.roomName}
      setPage={setPage}
    />)
  }
  return null
}

const pathToPage = (path: string): Page => {
  const gameMatch = /^\/game\/(.*)/i.exec(path)
  if (gameMatch) {
    return {view: 'game', roomName: gameMatch[1]}
  } else if (/^\/$/i.test(path)) {
    return {view: 'lobby'}
  } else if (/^\/rules$/i.test(path)) {
    return {view: 'rules'}
  } else if (/^\/topics$/i.test(path)) {
    return {view: 'topics'}
  } else {
    return {view: 'not-found'}
  }
}
const pageToPath = (page: Page): string => {
  if (page.view === 'game') {
    return `/game/${page.roomName}`
  } else if (page.view === 'lobby') {
    return '/'
  } else if (page.view === 'rules') {
    return '/rules'
  } else if (page.view === 'topics') {
    return '/topics'
  } else if (page.view === 'not-found') {
    return window.location.pathname
  } else {
    throw Error('Invalid page')
  }

}

startReact()
