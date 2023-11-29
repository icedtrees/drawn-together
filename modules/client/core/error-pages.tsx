import * as React from 'react'
import './css/bootswatch.css'

export const NotFoundPage = () => {
  return (
    <>
      <h1>Page Not Found</h1>
      <div className="alert alert-danger" role="alert">
        <span className="sr-only">Error:</span> Page Not Found
      </div>
    </>
  )
}
