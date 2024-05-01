import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TextInput from './Components/TextInput';
import DateInput from './Components/DateInput';
import SubmitButton from './Components/SubmitButton';
import PopupMessage from './Components/PopupMessage'; // Import the PopupMessage component
import { Link, useNavigate } from 'react-router-dom';
import API_URL from './config'; // Import the API URL
import MediTech from './assets/images/Meditech.png';

function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [f_name, setFname] = useState('');
  const [l_name, setLname] = useState('');
  const [dob, setDOB] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State to control the visibility of success popup
  const [redirect, setRedirect] = useState(false); 
  const [countdown, setCountdown] = useState(5); // Initial countdown value
  const navigate = useNavigate();

  useEffect(() => {
    let intervalId;
    if (redirect) {
      intervalId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    }
    return () => {
      clearInterval(intervalId);
    };
  },[redirect]);

  useEffect(() => {
    if (countdown === 0) {
      setRedirect(false); // Hide the success popup after countdown reaches 0
      navigate('/login'); // Redirect to the login page after successful registration
    }
  }, [countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/register/`, {
        username: username,
        f_name: f_name,
        l_name: l_name,
        dob: dob,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 201) {
        setRedirect(true); // Show the success popup
        setError('')
      }
      if (response.status === 226) {
        console.log('Username already registered');
        setError('Username already registered');
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
        // Clear all input fields
        setUsername('');
      }
    } catch (error) {
      if(error.response.status === 400){    
      setShowSuccessPopup(true);
      setError('Invalid Age, please try again(age must be above 5)');
      setTimeout(() => setShowSuccessPopup(false), 3000);
      setDOB('');
     } 
    }

    setLoading(false);
  };

  return (
    <div className='registration-page-container'>
    <div className="registration-form-container">
      <div className="form-content">
      <div className="image-container">
          <img src={MediTech} alt="Logo" />
      </div>
      <div className="form-container">
  
      <form onSubmit={handleSubmit}>
      <span className="login100-form-title"><h1>Register</h1></span>
        <TextInput
          label="Username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id="username"
          message="Username"
        />
        <TextInput
          label="First Name"
          type="text"
          value={f_name}
          onChange={(e) => setFname(e.target.value)}
          id="f_name"
          message="First Name"
        />
        <TextInput
          label="Last Name"
          type="text"
          value={l_name}
          onChange={(e) => setLname(e.target.value)}
          id="l_name"
          message="Last Name"
        />
        <DateInput
        
          label="Date of Birth"
          value={dob}
          onChange={(e) => setDOB(e.target.value)}
          id="dob"
          message="Date of Birth"
        />
        <TextInput
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          message="Password"
        />
        <SubmitButton loading={loading} text="Register" elseText="Registering..." />
      </form>
      {redirect && (<PopupMessage message={`Username created successfully. Redirecting to login page in ${countdown} seconds...`}/>)}
      {showSuccessPopup && (<PopupMessage message={error}/>)}
      <p>Already registered? <Link to="/login">Login here</Link></p>
    </div>
    </div>
    </div>
    </div>
  );
}

export default RegistrationForm;
