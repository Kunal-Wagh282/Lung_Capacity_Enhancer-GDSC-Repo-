import React, { useState, useEffect } from 'react';
import axios from 'axios';
  
import API_URL from './config'; // Import the API URL
import PopupMessage from './Components/PopupMessage';
import Sidebar from './Components/SideBar'; // Import your modal component
import DrawerComponent from './Components/AddUserDrawer'; 
import { Navbar } from './Components/Navbar';
import LineGraph from './Components/LineGraph';



function ProfilePage() {
  
  const [newChildUsername, setNewChildUsername] = useState('');
  const [newChildDOB, setNewChildDOB] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage,setErrorMessage] = useState('');
  const [selectedProfileAge, setSelectedProfileAge] = useState(null);
  const [addingChildUser, setAddingChildUser] = useState(false);
  const userDataString = sessionStorage.getItem('userData');
  const userData = JSON.parse(userDataString);
  const [profiles, setProfiles] = useState(userData.profile);
  const [uid, setUid] = useState(userData.u_id);
  const [selectedProfileName, setSelectedProfileName] = useState(profiles.find(profile => profile.uid === profiles.uid).p_name);
  const [isConnected, setIsConnected] = useState(false);
  const [device, setDevice] = useState(null);
  const [time, setTime] = useState([0.00]);
  const [volumePerSecond, setVolumePerSecond] = useState([0.00]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State to control the visibility of success popup
  const [characteristic, setCharacteristic] = useState(null);
  const [server, setServer] = useState(null);
  const [service, setService] = useState(null);
  const [totalVolume, setTotalVolume] = useState(0);
// const uid = userData.u_id;
// const profiles = userData.profile;
// const username = userData.username;
// const password = userData.password;


const connectToDevice = async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters:[{name:'LCE'}],
      optionalServices: ['0000fffe-0000-1000-8000-00805f9b34fb']
    });
    setDevice(device);

    const server = await device.gatt.connect();
    setServer(server);

    device.addEventListener('gattserverdisconnected', onDisconnected);

    if (device.gatt.connected) {
      setShowSuccessPopup(true);
      setError('Bluetooth Connected Successfully to:'+device.name);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      setIsConnected(true)
      const service = await server.getPrimaryService('0000fffe-0000-1000-8000-00805f9b34fb');
      setService(service);
      const characteristic = await service.getCharacteristic('0000fffc-0000-1000-8000-00805f9b34fb');
      setCharacteristic(characteristic);
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      if(age<10){var data=String('0'+age);}
      else{var data = String(age);}
      //console.log(data);
      await characteristic.writeValue(new TextEncoder().encode(data));
      
    } else {
      console.error('Device disconnected.');
      //alert('Device disconnected1')
    }
  } catch (error) {
    console.log(error)
  }
};
const handleCharacteristicValueChanged = (event) => {
  const value = event.target.value;
  const decoder = new TextDecoder('utf-8');
  const stringValue = decoder.decode(value);
  const [receivedTime, receivedVolume] = stringValue.split(',').map(parseFloat);
  setTime(prevTime => [...prevTime, receivedTime]);
  setVolumePerSecond(prevVolume => [...prevVolume, receivedVolume]); 
};




useEffect(()=>{
  if(isConnected) {
    const sendData = async () => {
      try{
        if(selectedProfileAge<10){
          var data=String('0'+selectedProfileAge);
        }else{
        var data = String(selectedProfileAge);}
       
        await characteristic.writeValue(new TextEncoder().encode(data));         
      }
      catch(error){       
      }
}
sendData(); // Invoke the async function to execute
}
},[selectedProfileName]);
  useEffect(() => {
      if (time.length!==1 && time[time.length - 1] === 0 ) {
    time.pop();
    volumePerSecond.pop();
    while( time[time.length - 1]===time[time.length - 2]){
      time.pop();
      volumePerSecond.pop();
    }
    const sendData = async () => { // Define async function
      setError('');
      try {
        const response = await axios.post(`${API_URL}/graph-data/`, {
          u_id:uid,
          p_name:selectedProfileName,
          time_array: time,
          volume_array: volumePerSecond
        });
        if (response.status === 201) {
          setShowSuccessPopup(true);
          setError('Data shared successfully!!');
          setTimeout(() => setShowSuccessPopup(false), 3000);
        }
        setTotalVolume(response.data["area"]);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    setTime([0.00]);
    setVolumePerSecond([0.00]);
    };
    sendData(); // Invoke the async function to execute
  }
  },[time]);    


  const disconnectDevice = async () => {
    try {
      if (device && device.gatt.connected) {
        await device.gatt.disconnect();
        setDevice(null);
        setTime([0.00]);
        setServer(null);
        setService(null);
        setVolumePerSecond([0.00]);
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting from device:', error);
    }
  };
  const onDisconnected = (event) => {
    alert("Device Disconnected");
    setDevice(null);
    setServer(null);
    setService(null);
    setTime([0.00]);
    setVolumePerSecond([0.00]);
    setIsConnected(false);
  };

useEffect(() => {
  sessionStorage.setItem('nowName', JSON.stringify(selectedProfileName));
},[])
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
    
    const selectedProfile = profiles.find(profile => profile.p_name === e.target.value);
    setSelectedProfileAge(calculateAge(selectedProfile.p_dob));
    setSelectedProfileName(e.target.value);  

    sessionStorage.setItem('nowName', JSON.stringify(e.target.value));
    const nowName = JSON.parse(sessionStorage.getItem('nowName'));
       
    //console.log("Name",selectedProfileName)
    //console.log("UID", uid)
  };
  const deleteChildUser = async () => {
    if (profiles.length === 1) {
      setSuccessMessage(true);
      setErrorMessage(`Main user can't be deleted`)
      setTimeout(() => setSuccessMessage(false), 3000);
      return;
    } else {
      setError('');
      try {
        const response = await axios.post(`${API_URL}/del-profile/`, {
          u_id: uid,
          p_name: selectedProfileName
        });
        if (response.status === 202) {
          setProfiles(response.data["profile"]);
          setSuccessMessage(true);
          setErrorMessage('Username deleted successfully.')
          setTimeout(() => setSuccessMessage(false), 3000);
        }
        if (response.status === 226) {
          setSuccessMessage(true);
          setErrorMessage(`Main user can't be deleted`)
          setTimeout(() => setSuccessMessage(false), 3000);
        }
      } catch (error) {
        setError(error)
      } 
    }
  };
  const handleAddChildUser = async () => {
    setError('');
    setAddingChildUser(true);
    let is400Error = false;
    try {
      const response = await axios.post(`${API_URL}/add-profile/`, {
        u_id: uid,
        p_name: newChildUsername,
        p_dob: newChildDOB,
      });
      if (response.status === 201) {
        setSelectedProfileName(newChildUsername);
        setSelectedProfileAge(calculateAge(newChildDOB)); 
        setProfiles(response.data["profile"]);
        setNewChildUsername('');
        setNewChildDOB('');
    
        setSuccessMessage(true);
        setErrorMessage('Username created successfully.');
        setTimeout(() => setSuccessMessage(false), 3000);
      }
      if (response.status === 204) {
        setSuccessMessage(true);
        setErrorMessage(`Invalid Age, please try again(age must be above 5)`)
        setTimeout(() => setSuccessMessage(false), 3000);
        setError(error)
        is400Error = true;
      }
      if (response.status === 226) {
        setSuccessMessage(true);
        setNewChildUsername('');
        setErrorMessage(`Username already exists, please try different username.`)
        setTimeout(() => setSuccessMessage(false), 3000);
        is400Error = true;
      }
      
    } catch (error) {  
        setSuccessMessage(true);
        setTimeout(() => setSuccessMessage(false), 3000);
    } finally {
      if (is400Error) {
        setAddingChildUser(false);
      } else {
        setAddingChildUser(false);
      }
    }
   
  };
  return (
    <>
    <div>
      <Navbar/>
    </div>
<div class="container-fluid">
  <div class="row">
    <div class="col-lg-6 col-sm-12 d-flex align-items-center justify-content-center mb-3 mt-4">
    <div style={{
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        maxWidth: '400px',
        maxHeight: '200px',
        margintop: '0px',
        marginleft: '120px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '20px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)'
      }}>
      {profiles.length > 0 && (
        <div>
          <select className="dropdown-select" value={selectedProfileName} onChange={handleProfileChange}>
            {profiles.map((profile, index) => (
              <option className="dropdown-option" key={index} value={profile.p_name}>
                {profile.p_name}   
              </option>
            ))}
          </select>
          <h4>Age of the selected User: {(selectedProfileAge === null)? (setSelectedProfileAge(calculateAge(profiles.find(profile => profile.uid === profiles.uid).p_dob))):selectedProfileAge}</h4>
          <div className='add-delete-button'>
            <button onClick={() => setAddingChildUser(true)}>Add User</button>
            <button onClick={() => deleteChildUser(true)}>Delete User</button>
          </div>
        </div>
      )}
      <DrawerComponent isOpen={addingChildUser} onClose={() => setAddingChildUser(false)} newChildUsername={newChildUsername} setNewChildUsername={setNewChildUsername} newChildDOB={newChildDOB} setNewChildDOB={setNewChildDOB} handleAddChildUser={handleAddChildUser}/>
      {successMessage && <PopupMessage message={errorMessage} />}
      </div>
    </div>
    
    <div class="col-lg-6 col-sm-12 d-flex align-items-center justify-content-center mb-3 mt-4 mr-8">
      <div style={{
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        maxWidth: '400px',
        maxHeight: '200px',
        margintop: '0px',
        marginleft: '120px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '20px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)'
      }}>
       
        <div className='bt-buttons'>
            <h3>Bluetooth Connection</h3>
            <br></br>
            <button className="bluetooth-button" onClick={connectToDevice} disabled={isConnected}>
                Connect
            </button>
            <button className="bluetooth-button" onClick={disconnectDevice} disabled={!isConnected}>
                Disconnect
            </button>
            <br></br>
            <br></br>
            {device && <h4>Status: Connected to: {device.name}</h4>}
            
            {!device && <h4>Status: Disconnected</h4>}
            </div>
      {showSuccessPopup && (<PopupMessage message={error}/>)}
      </div>
      </div>
      </div>
      </div>

        <div class="row">
          <div class="col-12 d-flex align-items-center justify-content-center mt-8">
            <div className='chart-canvas' >
                <LineGraph time={time} volumePerSecond={volumePerSecond}/>
                {<h3>Total Volume: {totalVolume} Liters</h3>}
            </div>
          </div>
        </div>
   
  


<Sidebar name={selectedProfileName}/>


    </>
  );
}
export default ProfilePage;

