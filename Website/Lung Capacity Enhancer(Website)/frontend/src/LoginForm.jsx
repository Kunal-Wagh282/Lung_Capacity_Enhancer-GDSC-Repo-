import React, { useState } from 'react';
import axios from 'axios';
import TextInput from './Components/TextInput';
import SubmitButton from './Components/SubmitButton';
import './LoginForm.css' // Import the CSS file
import { useNavigate ,Link } from 'react-router-dom';
import API_URL from './config'; // Import the API URL
import MediTech from './assets/images/Meditech.png';



function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/login/`, {
        username: username,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const userData = response.data;
      console.log(response.data);
      
      if (response.status === 200 || response.status === 204) {
        userData.username = username;
        userData.password = password;
        sessionStorage.setItem('userData', JSON.stringify(userData));
        navigate('/profiles');

      }
       // assuming the server sends back some response
    } catch (error) {
      setError('Invalid Username or Password...Try Again');
      setUsername('');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className = "page-container ">
    <div className="login-form-container"> {/* Apply the CSS class */}
      
      {error && <p className="error-message">{error}</p>} {/* Apply the CSS class */}
      <div className="form-content">
        <div className="image-container">
          <img src={MediTech} alt="Logo" />
        </div>
      <div className="form-container">
      <form onSubmit={handleSubmit}>
      <span className="login100-form-title"><h2>Login</h2></span>
        <TextInput
          type="text"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          id="username"
          message="Username"
        />
        <TextInput
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          message="Password"
        />
        
        <SubmitButton loading={loading} text="Login" elseText="Logging....."/>
      </form>
      <p>Don't have an account? <Link to="/">Register</Link></p>
    </div>
    </div>
    </div>
    </div>
  );
}

export default LoginForm;