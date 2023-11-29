import * as React from "react";
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
            setPage({view: 'lobby'})
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
  const headerMenu = [
    {
      title: user ? 'Lobby' : 'Home',
      page: {view: 'lobby'},
    }, {
      title: 'Rules',
      page: {view: 'rules'},
    },
// Topics page is not implemented yet
// {
//   title: 'Topics',
//   page: {view: 'topics'},
// },
  ]
  return (
    <ul className="nav navbar-nav" >
      {headerMenu.map((item) => {
        return (
          <li
            key={item.page.view}
            className={(item.page.view === page.view) ? 'active' : ''}
          >
            <a
              onClick={() => {
                setPage(item.page);
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
    return null
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