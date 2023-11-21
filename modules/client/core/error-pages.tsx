import * as React from '../../../node_modules/react'
import './css/bootswatch.css'

export const ForbiddenPage = () => {
  return (
    <>
      <h1>Forbidden</h1>
      <div className="alert alert-danger" role="alert">
        <span className="sr-only">Error:</span>
        You are not authorized to access this resource
      </div>
    </>
  )
}

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
