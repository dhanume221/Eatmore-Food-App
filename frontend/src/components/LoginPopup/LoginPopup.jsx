import React, { useContext, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const LoginPopup = ({ setShowLogin }) => {

    const { setToken, url, loadCartData } = useContext(StoreContext)
    const [currState, setCurrState] = useState("Login");
    const [otpStep, setOtpStep] = useState(false)
    const [otpCode, setOtpCode] = useState("")
    const [tempToken, setTempToken] = useState("")

    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setData(data => ({ ...data, [name]: value }))
    }

    const onLogin = async (e) => {
        e.preventDefault()

        let new_url = url;
        if (currState === "Login") {
            new_url += "/api/user/login";
        }
        else {
            new_url += "/api/user/register"
        }
        const response = await axios.post(new_url, data);
        if (response.data.success) {
            // If backend indicates 2FA is required, move to OTP step
            if (response.data.twoFactorRequired && currState === "Login") {
                setTempToken(response.data.tempToken || "")
                setOtpStep(true)
                return
            }
            // Normal flow (no 2FA required)
            if (response.data.token) {
                setToken(response.data.token)
                localStorage.setItem("token", response.data.token)
                loadCartData({ token: response.data.token })
                setShowLogin(false)
                return
            }
        }
        toast.error(response?.data?.message || "Unable to login. Please try again.")
    }

    const validateOtp = (code) => {
        return /^[0-9]{6}$/.test(code)
    }

    const onVerifyOtp = async (e) => {
        e.preventDefault()
        if (!validateOtp(otpCode)) {
            toast.error("Enter a valid 6-digit code")
            return
        }
        try {
            const resp = await axios.post(`${url}/api/user/2fa/verify`, { code: otpCode }, {
                headers: tempToken ? { "x-temp-token": tempToken } : undefined
            })
            if (resp.data?.success && resp.data?.token) {
                setToken(resp.data.token)
                localStorage.setItem("token", resp.data.token)
                loadCartData({ token: resp.data.token })
                setShowLogin(false)
                return
            }
            toast.error(resp.data?.message || "Invalid code")
        } catch (err) {
            toast.error("Verification failed")
        }
    }

    return (
        <div className='login-popup'>
            <form onSubmit={otpStep ? onVerifyOtp : onLogin} className="login-popup-container">
                <div className="login-popup-title">
                    <h2>{currState}</h2> <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
                <div className="login-popup-inputs">
                    {otpStep ? (
                        <input
                            name='otp'
                            onChange={(e) => setOtpCode(e.target.value.trim())}
                            value={otpCode}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder='6-digit Authenticator code'
                            required
                        />
                    ) : (
                        <>
                            {currState === "Sign Up" ? <input name='name' onChange={onChangeHandler} value={data.name} type="text" pattern='[a-zA-Z ]+' placeholder='Your name' required /> : <></>}
                            <input name='email' onChange={onChangeHandler} value={data.email} type="email" placeholder='Your email' required />
                            <input name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
                            <input name='phone' onChange={onChangeHandler} value={data.phone} type="number" placeholder='Phone Number' pattern="[0-9]*" maxLength={10} required />
                        </>
                    )}
                </div>
                <button>{otpStep ? "Verify Code" : (currState === "Login" ? "Login" : "Create account")}</button>
                <div className="login-popup-condition">
                    <input type="checkbox" name="" id="" required />
                    <p>By continuing, I agree to the terms of use & privacy policy.</p>
                </div>
                {!otpStep && (
                    currState === "Login"
                        ? <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
                        : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                )}
                {otpStep && (
                    <p>Open Google Authenticator and enter the 6-digit code.</p>
                )}
            </form>
        </div>
    )
}

export default LoginPopup
