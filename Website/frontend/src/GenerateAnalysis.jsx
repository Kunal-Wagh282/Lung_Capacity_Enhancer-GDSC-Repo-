import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';

import API_URL from './config'; // Import the API URL
import PopupMessage from './Components/PopupMessage';
import Sidebar from './Components/SideBar'; // Import your modal component
import DateInput from './Components/DateInput';
import SubmitButton from './Components/SubmitButton';
import { Line } from 'react-chartjs-2';

function GenerateAnalysis() {
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedProfileAge, setSelectedProfileAge] = useState(null);
  
  const userDataString = sessionStorage.getItem('userData');
  const userData = JSON.parse(userDataString);
  const [profiles, setProfiles] = useState(userData.profile);
  const [uid, setUid] = useState(userData.u_id);
  const [selectedProfileName, setSelectedProfileName] = useState(profiles.find(profile => profile.uid === profiles.uid).p_name);
  const [dob, setDOB] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState([]);
  const [fromdate, setFromDate] = useState('');
  const [todate, setToDate] = useState('');
  const [average_time_array, setaverage_time_array] = useState([]);
  const [date_array, setdate_array] = useState([]);



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

  const handleProfileChange = (e) => {
    e.preventDefault();
    const selectedProfile = profiles.find(profile => profile.p_name === e.target.value);
    setSelectedProfileAge(calculateAge(selectedProfile.p_dob));
    setSelectedProfileName(e.target.value);
    sessionStorage.setItem('nowName', JSON.stringify(e.target.value));
    // const nowName=JSON.parse(sessionStorage.getItem('nowName'));
    // console.log('from date',fromdate);
    // console.log('to date',todate);
  };

  const renderCharts = () => {
    
    return (
      <div  className="chart-container">
        <h3>Analysis</h3>
        <Line
          data={{
            labels:date_array ,
            datasets: [{
              label: 'Dates',
              data: average_time_array,
              borderColor: '#97dc21',
              fill: true
            }]
          }}
          options={{tension:0.4,
            scales: {
              x: {
                title:{
                  display: true,
                    text: 'Average Time'
                }
              },
              y: {
                title:{
                  display: true,
                    text: 'Timeline'
                }
              }
            }
          }}
        />
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nowName = JSON.parse(sessionStorage.getItem('nowName'));
    try {
        setLoading(true);
        const response = await axios.post(`${API_URL}/generate-report/`, {
            u_id: userData.u_id,
            p_name: nowName,
            from_date: fromdate,
            to_date: todate,
        });
        if (response.status === 204) {
            alert(`No data found` );
        } 
        if(response.status === 200) {
          setResponseData(response.data);
          setdate_array(response.data[0].date_array);
          setaverage_time_array(response.data[0].average_time_array);
          
        }
    } 
    catch (error) {
        console.log("Error fetching data:", error);
        
    }
    finally{
        setLoading(false);
        setFromDate('');
        setToDate('');
    }
};

  return (
    <>
      <div className="container-fluid">
        <div class="row">
            <div class="col-lg-12 col-sm-12 d-flex justify-content-center mb-3">
              <h2 className="text-center">Select User Name</h2>
            </div>
            <div class="col-lg-12 col-sm-12 d-flex align-items-center justify-content-center ml-4">
              {profiles.length > 0 && (
                <div>
                  <div class="col-lg-12 col-sm-12 d-flex align-items-center justify-content-center">
                  <select className="dropdown-select-history" value={selectedProfileName} onChange={handleProfileChange}>
                    {profiles.map((profile, index) => (
                      <option className="dropdown-option" key={index} value={profile.p_name}>
                        {profile.p_name}
                      </option>
                    ))}
                  </select>
                  </div>
                  <div class="col-lg-12 col-sm-12 d-flex align-items-center justify-content-center mt-2">
                  <h3>Age of the User: {(selectedProfileAge === null) ? (setSelectedProfileAge(calculateAge(profiles.find(profile => profile.uid === profiles.uid).p_dob))) : selectedProfileAge}</h3>
                </div>
                </div>
              )}
            </div>
              <br/><br/>
            <div class="col-lg-12 col-sm-12 d-flex align-items-center justify-content-center">
              <h2>Select dates to get analysis</h2>
            </div>

            <div class="col-lg-12 col-sm-12 d-flex align-items-center justify-content-center mt-5">
                <form className='historyForm2' onSubmit={handleSubmit}>
                  <p>Select from Date:- </p>
                <DateInput
                  label="Select from History Date"
                  value={fromdate}
                  onChange={(e) => setFromDate(e.target.value)}
                  id="fromdate"
                  message="User from History Date"
                  required
                />
                <br></br>
                <br></br>
                  <p>Select to Date:-</p>
                  <DateInput
                  label="Select  to History Date"
                  value={todate}
                  onChange={(e) => setToDate(e.target.value)}
                  id="todate"
                  message="User to History Date"
                  required
                /> 
                <br></br> 
                <div class="col-12 d-flex align-items-center justify-content-center">
                  <SubmitButton loading={loading} text="Generate Anaysis" elseText="Analysing..." />
                </div>
              </form>
            </div>
              {successMessage && <PopupMessage message={errorMessage} />}
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

export default GenerateAnalysis;
