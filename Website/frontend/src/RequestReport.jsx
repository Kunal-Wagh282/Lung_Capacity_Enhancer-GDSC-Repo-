import React, {useEffect} from "react";
import DateInput from './Components/DateInput'
import DrawerComponent from "./Components/Drawer2";
function RequestReport() {
    return (
        <>
        
        <DrawerComponent isOpen={addingChildUser} onClose={() => setAddingChildUser(false)} newChildUsername={newChildUsername} setNewChildUsername={setNewChildUsername} newChildDOB={newChildDOB} setNewChildDOB={setNewChildDOB} handleAddChildUser={handleAddChildUser}/>
</>
      );






export default  RequestReport;