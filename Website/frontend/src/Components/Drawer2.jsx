import React, { useState ,useEffect,useRef} from 'react';
import { Drawer,Typography, TextField, Button } from '@mui/material';
import "./Drawer.css";
import DateInput from "./DateInput"
import SubmitButton from "./SubmitButton"
import axios from "axios";
import API_URL from '../config'; // Import the API URL

function DrawerComponent({ isOpen, onClose,setIsDOpen,name}) {
    const sideDrawerRef = useRef(null);
    const [fromdate, setFromDate] = useState('');
    const [todate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);
    
    const userData = JSON.parse(sessionStorage.getItem('userData'));
   

    
    useEffect(() => {
        const handleClickOutside = (event) => {
          if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target)) {
            setIsDOpen(false);
          }
        };
    
        document.addEventListener("click", handleClickOutside);
    
        return () => {
          document.removeEventListener("click", handleClickOutside);
        };
      }, []);

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
            } else {
                // If response contains the PDF file
                // Create a Blob object from the received binary data
                const blob = new Blob([response.data], { type: 'application/pdf' });

                // Create a temporary URL for the Blob object
                const url = window.URL.createObjectURL(blob);

                // Create a link element
                const link = document.createElement('a');

                // Set the link's href to the temporary URL
                link.href = url;

                // Set the link's download attribute to the desired file name
                link.setAttribute('download', 'report.pdf');

                // Append the link to the document body
                document.body.appendChild(link);

                // Programmatically click the link to trigger the download
                link.click();

                // Remove the link from the document body
                document.body.removeChild(link);

                // Revoke the temporary URL to free up memory
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.log("Error fetching data:", error);
        }
        finally{
            setIsDOpen(false);
            setLoading(false);
            setFromDate('');
            setToDate('');
        }
    };

  return (
    <div>
      <Drawer anchor="bottom" open={isOpen} onClose={onClose}>
        <div className="sidebar-position">
          <Typography variant="h4">Select from date and to date to generate Report</Typography>
          <br/>
          <form className='historyForm2' onSubmit={handleSubmit}>
            <p>Select from Date</p>
          <DateInput
            label="Select from History Date"
            value={fromdate}
            onChange={(e) => setFromDate(e.target.value)}
            id="fromdate"
            message="User from History Date"
            required
          />
            <p>Select to Date</p>
            <DateInput
            label="Select  to History Date"
            value={todate}
            onChange={(e) => setToDate(e.target.value)}
            id="todate"
            message="User to History Date"
            required
          />    
          <SubmitButton loading={loading} text="Generate Report" elseText="Generating..." />
        </form>
        </div>
      </Drawer>
      
    </div>
  );
}

export default DrawerComponent;
