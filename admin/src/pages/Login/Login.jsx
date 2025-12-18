import React, { useState } from 'react'
import './Login.css'
import { url } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = ({ setToken }) => {

    const [currState, setCurrState] = useState("Login")
    const [data, setData] = useState({
        email: "",
        password: ""
    })
    const [twoFaCode, setTwoFaCode] = useState("")
    const [tempToken, setTempToken] = useState("")
    const [is2Fa, setIs2Fa] = useState(false)

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (event) => {
        event.preventDefault()

        if (is2Fa) {
            // Verify 2FA
            try {
                const response = await axios.post(url + "/api/user/2fa/verify", { code: twoFaCode }, { headers: { 'x-temp-token': tempToken } })
                if (response.data.success) {
                    setToken(response.data.token)
                    localStorage.setItem("token", response.data.token)
                    toast.success("Login Successful")
                } else {
                    toast.error(response.data.message)
                }
            } catch (error) {
                toast.error("Error verifying 2FA")
            }
            return
        }

        // Normal Login
        try {
            const { email, password } = data; // Destructure email and password from data
            const response = await axios.post(url + "/api/user/admin", { email, password })

            if (response.data.success) {
                if (response.data.twoFactorRequired) {
                    setIs2Fa(true)
                    setTempToken(response.data.tempToken)
                    toast.info("2FA Code Required")
                } else {
                    setToken(response.data.token)
                    localStorage.setItem("token", response.data.token)
                    toast.success("Login Successful")
                }
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error("Login Failed")
        }
    }

    return (
        <div className='login'>
            <form onSubmit={onLogin} className="login-container">
                <div className="login-title">
                    <h2>Admin Panel</h2>
                </div>
                <div className="login-inputs">
                    {!is2Fa ? (
                        <>
                            <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                            <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                        </>
                    ) : (
                        <>
                            <p>Enter 2FA Code</p>
                            <input onChange={(e) => setTwoFaCode(e.target.value)} value={twoFaCode} type="text" placeholder='000000' required />
                        </>
                    )}
                </div>
                <button type='submit'>{is2Fa ? "Verify" : "Login"}</button>
            </form>
        </div>
    )
}

export default Login
