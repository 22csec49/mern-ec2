import React from 'react';
import './App.css';

function Contact() {
  return (
    <div className="contact-container">
      <div className="top-row">
        <div className="left2">
          <p>"Let's Grow Together! Reach out to us and let's nurture your plant care journey, one leaf at a time."</p>
          <h1>Contact Form</h1>
          <div className="input-group">
            <p htmlFor="name">Name:</p>
            <input type="text" id="name" name="name" />
          </div>
          <div className="input-group">
            <p htmlFor="email">Email:</p>
            <input type="text" id="email" name="email" />
          </div>
          <div className="input-group">
            <p htmlFor="message">Message:</p>
            <textarea id="message" name="message" rows="4"></textarea>
          </div>
          <div className="checkbox-group">
            <input type="checkbox" id="terms" name="terms" />
            <label htmlFor="terms">I accept the terms and conditions</label>
          </div>
          <button className="button">Submit</button>
        </div>
        <div className="right2">
          <div className="contact-details">
            <p>Email: example@example.com</p>
            <p>Office: 123 Street, City</p>
            <p>Phone: +1234567890</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
