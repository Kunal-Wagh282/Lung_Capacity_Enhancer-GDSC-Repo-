import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './History.css';
import API_URL from './config'; // Import the API URL
import PopupMessage from './Components/PopupMessage';
import Sidebar from './Components/SideBar'; // Import your modal component
import DateInput from './Components/DateInput';
import SubmitButton from './Components/SubmitButton';
import { Line } from 'react-chartjs-2';

function History() {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProfileAge, setSelectedProfileAge] = useState(null);
  const [addingChildUser, setAddingChildUser] = useState(false);
  const userDataString = sessionStorage.getItem('userData');
  const userData = JSON.parse(userDataString);
  const [profiles, setProfiles] = useState(userData.profile);
  const [uid, setUid] = useState(userData.u_id);
  const [selectedProfileName, setSelectedProfileName] = useState(profiles.find(profile => profile.uid === profiles.uid).p_name);
  const [dob, setDOB] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState([]);

  const calculateAge = (dob) => {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    return age;
  };


  const fetchData = async () => {
   
    try {
      const response = await axios.post(`${API_URL}/get-graph-data/`, {
        u_id: uid,
        p_name: selectedProfileName,
        date: dob,
      });
      if (response.status === 200) {
        setResponseData(response.data);
      }
      if (response.status === 204) {
        alert(`No data found` )
        console.log("No data found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleProfileChange = (e) => {
    e.preventDefault();
    const selectedProfile = profiles.find(profile => profile.p_name === e.target.value);
    setSelectedProfileAge(calculateAge(selectedProfile.p_dob));
    setSelectedProfileName(e.target.value);
    sessionStorage.setItem('nowName', JSON.stringify(e.target.value));
    // const nowName=JSON.parse(sessionStorage.getItem('nowName'));
  };

  const renderCharts = () => {
    return responseData.map((entry, index) => (
      <div key={index} className="chart-container">
        <h3>Graph entry {index + 1}</h3>
        <Line
          data={{
            labels: entry.time_array,
            datasets: [{
              label: 'Volume',
              data: entry.volume_array,
              borderColor: '#97dc21',
              fill: true
            }]
          }}
          options={{tension:0.4,
            scales: {
              x: {
                title:{
                  display: true,
                    text: 'Time'
                }
              },
              y: {
                title:{
                  display: true,
                    text: 'Volume'
                }
              }
            }
          }}
        />
      </div>
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await fetchData();
    } catch (error) {
      setErrorMessage('Error fetching data');
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="history-page-container">
        <div class="container-fluid">
          <div class="row mt-4 mb-4">
              <div class="col-lg-6 col-sm-12 d-flex align-items-center justify-content-center justify-content-lg-end">
                  <h2>Select User Name:- </h2>
              </div>
              <div class="col-lg-6 col-sm-12 d-flex mt-5 justify-content-lg-start justify-content-center">
                  {profiles.length > 0 && (
                    <div className='select-user'>
                      <select className="dropdown-select-history" value={selectedProfileName} onChange={handleProfileChange}>
                        {profiles.map((profile, index) => (
                          <option className="dropdown-option" key={index} value={profile.p_name}>
                            {profile.p_name}
                          </option>
                        ))}
                      </select>
                      <br></br>
                      <br></br>
                      <h4>Age of the Selected User is:- {(selectedProfileAge === null) ? (setSelectedProfileAge(calculateAge(profiles.find(profile => profile.uid === profiles.uid).p_dob))) : selectedProfileAge}</h4>
                    </div>
                  )}
              </div>
          </div>
          <div class="row mt-5">
              <br/><br/>
              <div class="col-lg-6 col-sm-12 d-flex align-items-center justify-content-center justify-content-lg-end mt-4">
                <h2>Select date to get history:-</h2>
              </div>
              <div class="col-lg-6 col-sm-12 d-flex mt-5 justify-content-lg-start justify-content-center">
                <form className='historyForm' onSubmit={handleSubmit}>
                  <DateInput
                    label="Select History Date"
                    value={dob}
                    onChange={(e) => setDOB(e.target.value)}
                    id="dob"
                    message="User History Date"
                  />
                  { <SubmitButton loading={loading} text="Get History" elseText="Getting..." /> }
                </form>
              </div>
          </div>
         
          </div>
      </div>
      <Sidebar name={selectedProfileName} />
      {responseData.length > 0 && (
        <div className="charts-container">
          {renderCharts()}
        </div>
      )}
    </>
  );
}
export default History;