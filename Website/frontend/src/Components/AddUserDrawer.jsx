import React, { useState } from 'react';
import { Drawer,Typography, TextField, Button } from '@mui/material';


function DrawerComponent({ isOpen, onClose, newChildUsername, setNewChildUsername, newChildDOB, setNewChildDOB, handleAddChildUser }) {
  return (
    <div>
      <Drawer anchor="bottom" open={isOpen} onClose={onClose}>
        <div className="drawer-content">
          <Typography variant="h6">Add User</Typography>
          <TextField
            label="Name"
            value={newChildUsername}
            onChange={(e) => setNewChildUsername(e.target.value)}
            variant="outlined"
            margin="normal"
          /><br/>
          <TextField
            label="Date of Birth"
            type="date"
            value={newChildDOB}
            onChange={(e) => setNewChildDOB(e.target.value)}
            variant="outlined"
           
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
          <br/>
          <Button variant="contained" onClick={handleAddChildUser}>Add</Button>
        </div>
      </Drawer>
      <div className="content">
      </div>
    </div>
  );
}

export default DrawerComponent;