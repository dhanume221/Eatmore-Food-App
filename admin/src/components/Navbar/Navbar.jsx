import React from 'react'
import './Navbar.css'

const Navbar = ({ setToken }) => {

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  }

  return (
    <div className='navbar'>
      <img className='logo' src={'/logo.png'} alt="" />
      {setToken && (
        <React.Fragment>
          <button onClick={logout} className='navbar-logout'>Logout</button>
          <img className='profile' src={'/profile.png'} alt="" />
        </React.Fragment>
      )}
    </div>
  )
}

export default Navbar
