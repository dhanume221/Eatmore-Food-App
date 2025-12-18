import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login/Login'
import { url } from './assets/assets'

const App = () => {

  const [token, setToken] = React.useState(localStorage.getItem("token") || "");

  React.useEffect(() => {
    localStorage.setItem("token", token);
  }, [token])

  return (
    <div className='app'>
      <ToastContainer />
      {!token ? (
        <React.Fragment>
          <Navbar />
          <Login setToken={setToken} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Navbar setToken={setToken} />
          <hr />
          <div className="app-content">
            <Sidebar />
            <Routes>
              <Route path="/add" element={<Add url={url} token={token} />} />
              <Route path="/list" element={<List url={url} token={token} />} />
              <Route path="/orders" element={<Orders url={url} token={token} />} />
            </Routes>
          </div>
        </React.Fragment>
      )}
    </div>
  )
}

export default App