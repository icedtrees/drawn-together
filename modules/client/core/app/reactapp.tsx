import { createRoot } from '../../../../node_modules/react-dom/client'
import * as React from '../../../../node_modules/react'
import {TopicsPage} from "../../topics/topics";

export const startReact = () => {
  const root = createRoot(document.getElementById('react-root'))
  root.render(<ReactApp/>)
}

export let setCurrentPage = null

export const ReactApp = () => {
  const [page, setPage] = React.useState<string>(null)
  setCurrentPage = (p) => setPage(p)
  if (page === 'topics') {
    return (
      <TopicsPage/>
    )
  }
  return null
}