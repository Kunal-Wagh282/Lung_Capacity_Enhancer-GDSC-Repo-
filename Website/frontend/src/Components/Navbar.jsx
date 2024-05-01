import React from "react"

import Meditech from '../assets/images/Meditech.png';

export const Navbar=() => {
    return(
        <nav>
            <h2 >Dashboard</h2>
            <img src={Meditech}/>
        </nav>
    )
}