import * as React from "react";
import {menus, shouldRender} from "./services/menus.client.service";
import './css/bootswatch.css'
import './css/core.css'

export const Header = ({user, page, setPage}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  return (
    <header className="navbar navbar-fixed-top navbar-inverse">
      <div className="container">
        <div className="navbar-header">
          <button
            className="navbar-toggle"
            type="button"
            onClick={() => {setIsCollapsed(!isCollapsed)}}
          >
            <span className="icon-bar" />
            <span className="icon-bar" />
            <span className="icon-bar" />
          </button>
          <a className="navbar-brand" onClick={() => {
            setPage('home')
            window.state.go('home')
          }}>
            <i className="fa fa-pencil-square-o" /> Drawn Together
          </a>
        </div>
        <nav
          className={"navbar-collapse" + (isCollapsed ? ' collapse' : '')}
          role="navigation"
        >
          <MenuItems user={user} page={page} setPage={setPage}/>
          <AuthHeader user={user} page={page} setPage={setPage}/>
        </nav>
      </div>
    </header>
  )
}

const MenuItems = ({user, page, setPage}) => {
  return (
    <ul className="nav navbar-nav" >
      {menus['topbar'].items.toSorted((i, j) => i.position - j.position).map((item) => {
        if (!shouldRender(item, user)) {
          return null
        }
        return (
          <li
            key={item.state}
            className={(item.state === page) ? 'active' : ''}
          >
            <a
              onClick={() => {
                window.state.go(item.state);
                // Temporary hack to make sure that setPage runs after the angular code to reset the page state.
                // Once we are migrated to react we can delete this and make it synchronous
                setTimeout(() => {
                  setPage(item.state);
                })
              }}
            >{item.title}</a>
          </li>
        )
      })}
    </ul>
  )
}

const AuthHeader = ({user, page, setPage}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const dropdownRef = React.useRef(null)

  // Handle closing dropdown when clicking outside
  React.useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Add a delay because otherwise the dropdown closes before there's a chance for React to fire any
        // onclick events. there's probably a better way to do this
        setTimeout(() => setDropdownOpen(false), 100)
      }
    }
    document.addEventListener("mousedown", clickOutside)
    return () => {
      document.removeEventListener("mousedown", clickOutside)
    }
  }, [dropdownRef, setDropdownOpen])

  if (!user) {
    return (
      <ul className="nav navbar-nav navbar-right">
        <li className="divider-vertical" />
        <li className={page === 'authentication.signin' ? "active" : ''}>
          <a onClick={() => {
            window.state.go("authentication.signin")
            // Temporary hack to make sure that setPage runs after the angular code to reset the page state.
            // Once we are migrated to react we can delete this and make it synchronous
            setTimeout(() => {
              setPage('authentication.signin')
            })
          }}>Sign In</a>
        </li>
      </ul>
    )
  }
  return (
    <ul className="nav navbar-nav navbar-right">
      <li className={"dropdown" + (dropdownOpen ? " open" : "")} dropdown="">
        <a
          className="dropdown-toggle user-header-dropdown-toggle"
          dropdown-toggle=""
          onClick={() => setDropdownOpen(!dropdownOpen)}
          ref={dropdownRef}
          role="button"
        >
          <img
            /* We restructured the directories but i'm too lazy to figure out how to migrate all the db
             records so we have this budget migration for now */
            src={user.profileImageURL === 'modules/users/client/img/profile/default.png' ? 'modules/client/users/img/profile/default.png' : user.profileImageURL}
            alt={user.username}
            className="header-profile-image"
          />
          <span>{user.username}</span>
          <b className="caret" />
        </a>
        <ul className="dropdown-menu" role="menu">
          <li className={page === 'settings.profile' ? 'active' : ''}>
            <a onClick={() => {
              window.state.go("settings.profile")
              setPage('settings.profile')
            }}>Change Email</a>
          </li>
          <li className={page === 'settings.picture' ? 'active' : ''}>
            <a onClick={() => {
              window.state.go("settings.picture")
              setPage('settings.picture')
            }}>Change Profile Picture</a>
          </li>
          {user.provider === 'local' && (
            <li className={page === 'settings.remove-password' ? 'active' : ''}>
              <a onClick={() => {
                window.state.go("settings.remove-password")
                setPage('settings.remove-password')
              }}>Remove Password</a>
            </li>
          )}
          <li className="divider" />
          <li>
            <a href="/api/auth/signout" target="_self">
              Signout
            </a>
          </li>
        </ul>
      </li>
    </ul>
  )
}