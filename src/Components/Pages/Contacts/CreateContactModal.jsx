import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from "@mui/material";

const initialState = {
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  position: null,
  company: null,
  assignedTo: null,
  //   linkedin_url: null,
  //   notes: null,
  //   address: {
  //     street: null,
  //     city: null,
  //     state: null,
  //     zip: null,
  //     country: null,
  //   },
};

export default function CreateContactModal({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.") && formData.address) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = () => {
    onSave(formData); // pass data back to parent
    setFormData(initialState); // ✅ clear form
    onClose(); // close modal
  };

  const handleClose = () => {
    setFormData(initialState); // ✅ clear form when closing without saving
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            width: 500,
            height: 600,
          },
        },
      }}
    >
      <DialogTitle>Create Contact</DialogTitle>
      <DialogContent dividers sx={{ overflowY: "auto" }}>
        <Grid container spacing={3} mt={1}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label="Position" name="position" value={formData.position} onChange={handleChange} />
          </Grid>
          {/* <Grid item xs={6}>
            <TextField fullWidth label="Company" name="company" value={formData.company} onChange={handleChange} />
          </Grid> */}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="success" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
