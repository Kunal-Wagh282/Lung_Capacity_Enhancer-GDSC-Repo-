import React, {useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../config'; // Import the API URL
import PopupMessage from './PopupMessage';
import './BleButton.css';
import LineGraph from './LineGraph';

function BleButton({uid,name,age}) {
    const [isConnected, setIsConnected] = useState(false);
    const [device, setDevice] = useState(null);
    const [time, setTime] = useState([0.00]);
    const [volumePerSecond, setVolumePerSecond] = useState([0.00]);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false); // State to control the visibility of success popup
    const [error, setError] = useState('');
    const [characteristic, setCharacteristic] = useState(null);
    const [server, setServer] = useState(null);
    const [service, setService] = useState(null);
    const [totalVolume, setTotalVolume] = useState(0);
    
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
            console.log(data);
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
            if(age<10){
              var data=String('0'+age);
            }else{
            var data = String(age);}
           
            await characteristic.writeValue(new TextEncoder().encode(data));         
          }
          catch(error){       
          }
    }
    sendData(); // Invoke the async function to execute
    }
    },[name]);




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
              p_name:name,
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


      


    
      // console.log("Time",time)
      // console.log("Volume", volumePerSecond)
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
    return (
        <>
        <div className='bt-buttons'>
            <h5>Bluetooth Connection</h5>
            <button className="bluetooth-button" onClick={connectToDevice} disabled={isConnected}>
                Connect
            </button>
            <button className="bluetooth-button" onClick={disconnectDevice} disabled={!isConnected}>
                Disconnect
            </button>
            <br></br>
            {device && <h6>Status: Connected to: {device.name}</h6>}
            
            {!device && <h6>Status: Disconnected</h6>}
            </div>
      {showSuccessPopup && (<PopupMessage message={error}/>)}
      <div className='chart-canvas'>
      <LineGraph time={time} volumePerSecond={volumePerSecond}/>
      {<h3>Total Volume: {totalVolume} Litres</h3>}
         </div>
        </>
    );
}
  
export default BleButton;
