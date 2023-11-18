import * as React from '../../../node_modules/react'

export const TopicsPage = ({user}) => {
  return (
    <section className="container">
      <h1>Topics</h1>
      <div>Logged in user: {user ? user.username: 'Not logged in'}</div>
    </section>
  )
}