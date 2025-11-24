import React, { useState, useContext } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './DeliveryPartnerLogin.css';

const DeliveryPartnerLogin = () => {
    const [currState, setCurrState] = useState("Login");
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        vehicleType: "Bike",
        vehicleNumber: ""
    });

    const { url, setToken } = useContext(StoreContext);

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }));
    };

    const onLogin = async (event) => {
        event.preventDefault();
        let newUrl = url;
        if (currState === "Login") {
            newUrl += "/api/delivery-partner/login";
        } else {
            newUrl += "/api/delivery-partner/register";
        }

        const response = await axios.post(newUrl, data);
        if (response.data.success) {
            setToken(response.data.token);
            localStorage.setItem("partnerToken", response.data.token);
            toast.success(`${currState} successful`);
            window.location.href = "/delivery-dashboard";
        } else {
            toast.error(response.data.message);
        }
    };

    return (
        <div className='delivery-login'>
            <form onSubmit={onLogin} className="delivery-login-container">
                <div className="delivery-login-title">
                    <h2>{currState}</h2>
                </div>
                <div className="delivery-login-inputs">
                    {currState === "Sign Up" && (
                        <>
                            <input
                                name='name'
                                onChange={onChangeHandler}
                                value={data.name}
                                type="text"
                                placeholder='Your name'
                                required
                            />
                            <input
                                name='phone'
                                onChange={onChangeHandler}
                                value={data.phone}
                                type="tel"
                                placeholder='Phone number'
                                required
                            />
                            <select
                                name='vehicleType'
                                onChange={onChangeHandler}
                                value={data.vehicleType}
                                required
                            >
                                <option value="Bike">Bike</option>
                                <option value="Scooter">Scooter</option>
                                <option value="Car">Car</option>
                            </select>
                            <input
                                name='vehicleNumber'
                                onChange={onChangeHandler}
                                value={data.vehicleNumber}
                                type="text"
                                placeholder='Vehicle number'
                                required
                            />
                        </>
                    )}
                    <input
                        name='email'
                        onChange={onChangeHandler}
                        value={data.email}
                        type="email"
                        placeholder='Your email'
                        required
                    />
                    <input
                        name='password'
                        onChange={onChangeHandler}
                        value={data.password}
                        type="password"
                        placeholder='Password'
                        required
                    />
                </div>
                <button type='submit'>{currState === "Sign Up" ? "Create account" : "Login"}</button>
                <div className="delivery-login-condition">
                    {currState === "Login" ? (
                        <p>Create a new account? <span onClick={() => setCurrState("Sign Up")}>Click here</span></p>
                    ) : (
                        <p>Already have an account? <span onClick={() => setCurrState("Login")}>Login here</span></p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default DeliveryPartnerLogin;