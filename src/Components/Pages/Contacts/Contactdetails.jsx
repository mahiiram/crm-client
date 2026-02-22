import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowLeft } from "lucide-react";

import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import CreateContactModal from "./CreateContactModal";
import { useSelector } from "react-redux";

const ContactDetails = () => {
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    fetchContact();
  }, [id]);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContact(res.data);
    } catch (err) {
      console.error("Error fetching contact:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/contacts"); // go back to contacts list after deletion
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const handleSave = async (updatedData) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/contacts/${id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContact(); // refresh after edit
      setOpenEdit(false);
    } catch (err) {
      console.error("Error updating contact:", err);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress />
      </Box>
    );

  if (!contact)
    return (
      <Typography variant="h6" color="error">
        Contact not found
      </Typography>
    );

  return (
    <Box p={3}>
      {/* Top Nav */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate("/contacts")}>
          <ArrowLeft />
        </IconButton>
        <Box>
          <IconButton color="primary" onClick={() => setOpenEdit(true)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Contact Details */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <Typography fontWeight="bold">First Name:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{contact.firstName}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography fontWeight="bold">Last Name:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{contact.lastName}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography fontWeight="bold">Email:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{contact.email || "--"}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography fontWeight="bold">Phone:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{contact.phone || "--"}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography fontWeight="bold">Position:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{contact.position || "--"}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography fontWeight="bold">Created At:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{dayjs(contact.createdAt).format("MMM D, YYYY h:mm A")}</Typography>
              </Grid>

              <Grid item xs={5}>
                <Typography fontWeight="bold">Updated At:</Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography>{dayjs(contact.updatedAt).format("MMM D, YYYY h:mm A")}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Right Panel - Activities */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Activities
            </Typography>
            {contact.activities && contact.activities.length > 0 ? (
              contact.activities.map((act, idx) => (
                <Box key={idx} mb={2} p={1} sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                  <Typography fontWeight="bold">{act.type}</Typography>
                  <Typography>{act.note}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(act.date).format("MMM D, YYYY h:mm A")}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography>No activities yet</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Modal */}
      <CreateContactModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSave={handleSave}
        initialData={contact}
      />
    </Box>
  );
};

export default ContactDetails;
