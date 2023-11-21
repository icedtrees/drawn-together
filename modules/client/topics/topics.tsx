import * as React from 'react'

export const TopicsPage = ({user}) => {
  return (
    <section className="container">
      <h1>Topics</h1>
      <div>Logged in user: {user ? user.username: 'Not logged in'}</div>
    </section>
  )
}