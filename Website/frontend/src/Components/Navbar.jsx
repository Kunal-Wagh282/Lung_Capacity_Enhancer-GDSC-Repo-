import React from "react"
import Meditech from '../assets/images/Meditech.png';

export const Navbar=() => {
    return(
        <nav>
        
            <h1 className="text-center" style={{ marginLeft: '55px'}}>Dashboard</h1>
            
            <img src={Meditech}/>
            
    
        </nav>
    )
}