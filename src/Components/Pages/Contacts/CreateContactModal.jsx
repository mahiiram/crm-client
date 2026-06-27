// import React, { useState } from "react";
// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid } from "@mui/material";

// const initialState = {
//   firstName: null,
//   lastName: null,
//   email: null,
//   phone: null,
//   position: null,
//   company: null,
//   assignedTo: null,
//   //   linkedin_url: null,
//   //   notes: null,
//   //   address: {
//   //     street: null,
//   //     city: null,
//   //     state: null,
//   //     zip: null,
//   //     country: null,
//   //   },
// };

// export default function CreateContactModal({ open, onClose, onSave }) {
//   const [formData, setFormData] = useState(initialState);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name.startsWith("address.") && formData.address) {
//       const field = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         address: { ...prev.address, [field]: value },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleSubmit = () => {
//     onSave(formData); // pass data back to parent
//     setFormData(initialState); // ✅ clear form
//     onClose(); // close modal
//   };

//   const handleClose = () => {
//     setFormData(initialState); // ✅ clear form when closing without saving
//     onClose();
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={handleClose}
//       slotProps={{
//         paper: {
//           sx: {
//             width: 500,
//             height: 600,
//           },
//         },
//       }}
//     >
//       <DialogTitle>Create Contact</DialogTitle>
//       <DialogContent dividers sx={{ overflowY: "auto" }}>
//         <Grid container spacing={3} mt={1}>
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="First Name"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               required
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="Last Name"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               required
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField
//               fullWidth
//               label="Email"
//               name="email"
//               type="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
//           </Grid>
//           <Grid item xs={6}>
//             <TextField fullWidth label="Position" name="position" value={formData.position} onChange={handleChange} />
//           </Grid>
//           {/* <Grid item xs={6}>
//             <TextField fullWidth label="Company" name="company" value={formData.company} onChange={handleChange} />
//           </Grid> */}
//         </Grid>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={handleClose}>Cancel</Button>
//         <Button variant="contained" color="success" onClick={handleSubmit}>
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MailIcon from "@mui/icons-material/Mail";
import PhoneIcon from "@mui/icons-material/Phone";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import InputAdornment from "@mui/material/InputAdornment";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ContactPageIcon from "@mui/icons-material/ContactPage";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";

const initialState = {
  firstName: null,
  lastName: null,
  email: null,
  phone: null,
  position: null,
  company: null,
  assignedTo: null,
};
const CommonInputAdornment = ({ children }) => (
  <InputAdornment position="start">
    {React.cloneElement(children, {
      sx: {
        mr: 1,
        fontSize: "18px",
        color: "green",
      },
    })}
  </InputAdornment>
);
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    boxShadow: "0 20px 64px rgba(0, 0, 0, 0.15)",
    maxWidth: "540px",
    width: "100%",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontSize: "22px",
  fontWeight: 500,
  padding: "24px 24px 16px",
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: 0,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    fontSize: "14px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": {
      borderColor: theme.palette.divider,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.action.hover,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}20`,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: "13px",
    fontWeight: 500,
    color: theme.palette.text.primary,
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

const RequiredAsterisk = styled("span")(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: "4px",
  fontWeight: 600,
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: theme.palette.text.secondary,
  marginTop: "20px",
  marginBottom: "12px",
  display: "block",
}));

export default function CreateContactModal({ open, onClose, onSave }) {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
    setFormData(initialState);
    onClose();
  };

  const handleClose = () => {
    setFormData(initialState);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      <StyledDialogTitle sx={{ display: "flex", justifyContent: "center", color: "green", fontWeight: 700 }}>
        Create Contact
      </StyledDialogTitle>

      <DialogContent dividers sx={{ overflowY: "auto", py: 3, px: 3 }}>
        {/* Basic Info Section */}
        <SectionLabel sx={{ mt: 1, mb: 2 }}>Contact information</SectionLabel>
        <Grid container spacing={5} mb={4}>
          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label={
                <>
                  First name <RequiredAsterisk>*</RequiredAsterisk>
                </>
              }
              name="firstName"
              placeholder="John"
              value={formData.firstName || ""}
              onChange={handleChange}
              required
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <CommonInputAdornment>
                      <AccountCircleIcon />
                    </CommonInputAdornment>
                  ),
                },
              }}
              InputLabelProps={{
                required: false,
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label={
                <>
                  Last name <RequiredAsterisk>*</RequiredAsterisk>
                </>
              }
              name="lastName"
              placeholder="Doe"
              value={formData.lastName || ""}
              onChange={handleChange}
              required
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <CommonInputAdornment>
                      <AccountCircleIcon />
                    </CommonInputAdornment>
                  ),
                },
              }}
              InputLabelProps={{
                required: false,
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label={
                <>
                  Email address <RequiredAsterisk>*</RequiredAsterisk>
                </>
              }
              name="email"
              type="email"
              placeholder="john@company.com"
              value={formData.email || ""}
              onChange={handleChange}
              required
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <CommonInputAdornment>
                      <MailOutlineIcon />
                    </CommonInputAdornment>
                  ),
                },
              }}
              InputLabelProps={{
                required: false,
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={formData.phone || ""}
              onChange={handleChange}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <PhoneIcon
                      sx={{
                        mr: 1,
                        fontSize: "18px",
                        color: "green",
                      }}
                    />
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Professional Info Section */}
        <SectionLabel sx={{ mt: 3, mb: 2 }}>Professional details</SectionLabel>
        <Grid container spacing={5} mb={2}>
          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label="Position"
              name="position"
              placeholder="Senior Developer"
              value={formData.position || ""}
              onChange={handleChange}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <CommonInputAdornment>
                      <WorkIcon />
                    </CommonInputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid item xs={6}>
            <StyledTextField
              fullWidth
              label="Company"
              name="company"
              placeholder="Acme Inc."
              value={formData.company || ""}
              onChange={handleChange}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <CommonInputAdornment>
                      <BusinessIcon />
                    </CommonInputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <StyledTextField
              fullWidth
              label="Assigned to"
              name="assignedTo"
              placeholder="Select team member"
              value={formData.assignedTo || ""}
              onChange={handleChange}
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <CommonInputAdornment>
                      <PersonIcon />
                    </CommonInputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        {/* Helper Text */}
        <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            Fields marked with <RequiredAsterisk>*</RequiredAsterisk> are required
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5, justifyContent: "flex-end" }}>
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 500,
            padding: "10px 24px",
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            backgroundColor: "transparent",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "action.hover",
              borderColor: "action.disabled",
            },
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            textTransform: "none",
            fontSize: "14px",
            fontWeight: 600,
            padding: "10px 28px",
            borderRadius: "8px",
            backgroundColor: "green",
            boxShadow: "none",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              //backgroundColor: "primary.dark",
              backgroundColor: "#2B89E3",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              transform: "translateY(-2px)",
            },
          }}
        >
          Save contact
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
