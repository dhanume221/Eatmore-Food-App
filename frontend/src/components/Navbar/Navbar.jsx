import React, { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const { getTotalCartAmount, token ,setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  useEffect(() => {
    const body = document.body
    if (theme === 'dark') {
      body.classList.add('dark')
    } else {
      body.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
    // Inform app-level listeners so things like ToastContainer can update theme
    try {
      window.dispatchEvent(new CustomEvent('themechange', { detail: theme }))
    } catch (e) {}
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    navigate('/')
  }

  return (
    <div className='navbar'>
      <Link to='/'><img className='logo' src={assets.logo} alt="" /></Link>
      <ul className="navbar-menu">
        <Link to="/" onClick={() => setMenu("home")} className={`${menu === "home" ? "active" : ""}`}>Home</Link>
        <a href='#explore-menu' onClick={() => setMenu("menu")} className={`${menu === "menu" ? "active" : ""}`}>Menu</a>
        <a href='#app-download' onClick={() => setMenu("mob-app")} className={`${menu === "mob-app" ? "active" : ""}`}>Download App</a>
        <a href='#footer' onClick={() => setMenu("contact")} className={`${menu === "contact" ? "active" : ""}`}>Contact Us</a>
      </ul>
      <div className="navbar-right">
        <img src={assets.search_icon} alt="" />
        {token && (
          <Link to='/cart' className='navbar-search-icon'>
            <img src={assets.basket_icon} alt="" />
            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
          </Link>
        )}
        {!token ? <>
            <button onClick={() => setShowLogin(true)}>sign in</button>
            <button onClick={() => window.location.href = '/delivery-login'}>Delivery Partner</button>
            <button onClick={() => window.location.href = 'http://localhost:5174'}>Admin Login</button>
            <button
              type="button"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className={`theme-toggle ${theme === 'dark' ? 'on' : ''}`}
              onClick={toggleTheme}
            >
            <span className="toggle-track">
                <span className="toggle-thumb">
                  {theme === 'dark' ? (
                    // Moon icon
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M21 12.79C20.38 12.93 19.73 13 19.06 13C14.67 13 11.06 9.39 11.06 5C11.06 4.33 11.13 3.68 11.27 3.06C7.68 3.84 5 7.02 5 10.81C5 15.2 8.58 18.81 12.97 18.81C16.76 18.81 19.94 16.13 20.72 12.54C20.83 12.63 20.92 12.71 21 12.79Z" fill="#111827"/>
                    </svg>
                  ) : (
                    // Sun icon
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <circle cx="12" cy="12" r="4" fill="#F59E0B"/>
                      <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                        <line x1="12" y1="2" x2="12" y2="5"/>
                        <line x1="12" y1="19" x2="12" y2="22"/>
                        <line x1="2" y1="12" x2="5" y2="12"/>
                        <line x1="19" y1="12" x2="22" y2="12"/>
                        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
                        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
                        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
                      </g>
                    </svg>
                  )}
                </span>
              </span>
            </button>
          </>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" />
            <ul className='navbar-profile-dropdown'>
              <li onClick={()=>navigate('/myorders')}> <img src={assets.bag_icon} alt="" /> <p>Orders</p></li>
              <hr />
              <li onClick={()=>navigate('/settings/2fa')}> <img src={assets.profile_icon} alt="" /> <p>Two-Factor</p></li>
              <hr />
              <li onClick={logout}> <img src={assets.logout_icon} alt="" /> <p>Logout</p></li> 
            </ul>
          </div>
        }
        {token && (
          <button
            type="button"
            aria-label="Toggle dark mode"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`theme-toggle ${theme === 'dark' ? 'on' : ''}`}
            onClick={toggleTheme}
          >
            <span className="toggle-track">
              <span className="toggle-thumb">
                {theme === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M21 12.79C20.38 12.93 19.73 13 19.06 13C14.67 13 11.06 9.39 11.06 5C11.06 4.33 11.13 3.68 11.27 3.06C7.68 3.84 5 7.02 5 10.81C5 15.2 8.58 18.81 12.97 18.81C16.76 18.81 19.94 16.13 20.72 12.54C20.83 12.63 20.92 12.71 21 12.79Z" fill="#111827"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" fill="#F59E0B"/>
                    <g stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="2" x2="12" y2="5"/>
                      <line x1="12" y1="19" x2="12" y2="22"/>
                      <line x1="2" y1="12" x2="5" y2="12"/>
                      <line x1="19" y1="12" x2="22" y2="12"/>
                      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/>
                      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                      <line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
                      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/>
                    </g>
                  </svg>
                )}
              </span>
            </span>
          </button>
        )}

      </div>
    </div>
  )
}

export default Navbar
