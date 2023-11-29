import * as React from 'react'
import './css/users.css'

export const SignInPage = ({setPage, setUser}) => {
  // Get an eventual error defined in the URL query string:
  const [error, setError] = React.useState(null)
  const [username, setUsername] = React.useState('')

  const onSignIn = function (e) {
    e.preventDefault() // Prevent page reload caused by form submit
    if (username.trim().length < 1) {
      setError("Username is required.")
      return
    }
    fetch('/api/auth/signin', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({username}),
    }).then((response) => {
      if (!response.ok) {
        response.json().then((error) => {
          setError(error.message)
        })
        return Promise.reject()
      }
      return response.json()
    }).then((user) => {
      setUser(user)
      setTimeout( () => { setPage({view: 'lobby'}) })
    })
  }
  return (
    <>
      <section
        className="row"
        style={{ width: "100%" }}
      >
        <div className="col-xs-12 col-sm-offset-3 col-sm-6 col-md-offset-1 col-md-5 text-left">
          <div className="description-text">
            <p>
              Play online pictionary with your friends! Each person will take turns
              drawing a word which everyone else tries to guess in the time limit.
              The person with the most points wins.
            </p>
            <p>
              You can choose your own game settings and enter your own custom word
              lists!
            </p>
            <p>Be drawn together by the fun!</p>
          </div>
          <img className="img-thumbnail" src="modules/client/game/img/demo.png" />
        </div>
        <div className="col-xs-12 col-sm-offset-3 col-sm-6 col-md-offset-1 col-md-5 text-center">
          <div>
            <div className="col-md-offset-1 col-md-7">
              <h3>Let's play!</h3>
              <form
                name="userForm"
                onSubmit={onSignIn}
                className="signin"
                noValidate=""
                autoComplete="off"
              >
                <fieldset>
                  <div className={"form-group" + (error ? ' has-error' : '')}>
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form-control"
                      placeholder="Username"
                      required=""
                      onChange={(e) => {
                        setUsername(e.target.value)
                        setError(null)
                      }}
                      value={username}
                    />
                    <div role="alert">
                      <p className="help-block">
                        <span>{error}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-center form-group">
                    <button type="submit" className="btn btn-primary">
                      Play
                    </button>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}