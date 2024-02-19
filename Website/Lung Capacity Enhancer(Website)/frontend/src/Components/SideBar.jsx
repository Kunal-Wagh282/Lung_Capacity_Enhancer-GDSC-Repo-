import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faList,
  faUser,
  faHistory,
  faFileArchive,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import DrawerComponent from "./Drawer2";
import "./Sidebar.css";

// Profile component


function SideBar({ name }) { // Receive `name` prop here
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isDOpen, setIsDOpen] = useState(false);
  //const [nowName, setNowName] = useState( JSON.parse(sessionStorage.getItem('nowName')));


  const handleTrigger = () => setIsOpen(!isOpen);
  const Profile = ({ name }) => (
    <div className="profile">
      <FontAwesomeIcon icon={faUser} />
      <span>{name}</span>
    </div>
  );
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);



  const nowName=JSON.parse(sessionStorage.getItem('nowName'));
  
  // useEffect(() => {
  //  setNowName( JSON.parse(sessionStorage.getItem('nowName')));
  //       console.log(nowName)
        
  // },[nowName])
  

  return (
    <div className="App">
      <div className="page">

        <div ref={sidebarRef} className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
          <div className="trigger" onClick={handleTrigger}>
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
          </div>

        
            <Link to="/profiles" className="profile-container">
            <Profile name={name}/>
            
          </Link>

          {/* Link to Menu item 2 route */}
          <Link to="/history" className="sidebar-position">
            <FontAwesomeIcon icon={faHistory} />
            <span>History</span>
          </Link>

          {/* Link to Menu item 3 route */}
          <div className="sidebar-position" onClick={() => setIsDOpen(true)} >
          
            <DrawerComponent isOpen={isDOpen} onClose={() => setIsDOpen(false)} setIsDOpen={setIsDOpen} name={nowName}/>

            <FontAwesomeIcon icon={faFileArchive} />
            <span>Generate Report</span>
            </div>

          {/* Link to Logout */}
          <Link to="/login" className="sidebar-position">
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
