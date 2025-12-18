import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="" width={150} height={150} style={{ filter: 'brightness(0) invert(1)' }} />
          <p>EatMore is your all-in-one food delivery companion designed to bring delicious meals from your favorite local restaurants straight to your door — fast, affordable, and hassle-free. Whether you’re craving a quick bite, healthy meal, or late-night snack, EatMore makes it easy to order exactly what you want with just a few taps.

            <br></br> Our mission is simple: to connect people with great food experiences every day.

            Join thousands of happy customers discovering better ways to eat, share, and enjoy food. With EatMore, your next meal is never far away.</p>

          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt="" />
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+971512456789</li>
            <li>contact@eatmore.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">Copyright 2024 © EatMore - All Right Reserved.</p>
    </div>
  )
}

export default Footer
