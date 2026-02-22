import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Filter, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Typography,
  Box,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CreateContactModal from "./CreateContactModal";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const ContactsTable = ({ token }) => {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [verificationText, setVerificationText] = useState("");

  const navigate = useNavigate();

  const [totalContacts, setTotalContacts] = useState(0);

  useEffect(() => {
    setSelectedContacts([]);
  }, [currentPage, pageSize]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/contacts?page=${currentPage}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setContacts(res.data.contacts || []);
      setFiltered(res.data.contacts || []); // optional, if you use filtered for search
      setTotalContacts(res.data.total || 0);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentPage, pageSize]);

  // Handle contact creation
  const handleSave = async (contactData) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/contacts/`, contactData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContacts(); // refresh after create
    } catch (err) {
      console.error("Error creating contact:", err);
    }
  };
  const paginatedData = contacts;
  const totalPages = Math.ceil(totalContacts / pageSize);

  const handleFilterByDate = (field) => {
    const sorted = [...filtered].sort((a, b) => new Date(b[field]) - new Date(a[field]));
    setFiltered(sorted);
  };

  // Checkbox logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedContacts(paginatedData.map((c) => c._id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedContacts((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };
  const handleDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/contacts/batch-delete`, {
        data: { ids: selectedContacts },
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpenDelete(false);
      setSelectedContacts([]);
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contacts:", err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Contacts
        </Typography>
        <Button variant="contained" color="success" startIcon={<Plus size={16} />} onClick={() => setOpenCreate(true)}>
          Create Contact
        </Button>
      </Box>
      <CreateContactModal open={openCreate} onClose={() => setOpenCreate(false)} onSave={handleSave} />
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => handleFilterByDate("createdAt")} startIcon={<Filter size={14} />}>
            Created Date
          </Button>
          <Button variant="outlined" onClick={() => handleFilterByDate("updatedAt")} startIcon={<Filter size={14} />}>
            Updated Date
          </Button>
        </Box>
        {selectedContacts.length > 0 && (
          <Button
            variant="contained"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={() => setOpenDelete(true)}
          >
            Delete ({selectedContacts.length})
          </Button>
        )}
      </Box>

      {/* <Box
        sx={{
          height: "500px", // full height of parent
          display: "flex",
          flexDirection: "column",
      > */}
      <Box
        sx={{
          height: "calc(90vh - 180px)", // adjust based on header height
          overflow: "auto",
        }}
      >
        {/* Your Table here */}

        <TableContainer
          component={Paper}
          sx={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 260px)", // ⭐ IMPORTANT
            borderRadius: 3,
            boxShadow: 2,
            border: "1px solid #e0e0e0",
          }}
        >
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedContacts.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    sx={{ color: "primary.main" }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Updated At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((contact, index) => {
                  const isSelected = selectedContacts.includes(contact._id);
                  return (
                    <TableRow
                      key={contact._id}
                      hover
                      onClick={(e) => {
                        if (e.target.type !== "checkbox") navigate(`/contact/${contact._id}`);
                      }}
                      sx={{
                        cursor: "pointer",
                        transition: "0.2s all",
                        backgroundColor: isSelected ? "primary.lighter" : index % 2 === 0 ? "#fcfcfc" : "white",
                        "&:hover": {
                          backgroundColor: isSelected ? "primary.lighter" : "#f0f4ff",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => handleSelectOne(contact._id)} color="primary" />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500, color: "#333" }}>
                        {contact.firstName} {contact.lastName}
                      </TableCell>
                      <TableCell>{contact.email || "--"}</TableCell>
                      <TableCell>{contact.phone || "--"}</TableCell>
                      <TableCell>{contact.position || "--"}</TableCell>
                      <TableCell>{dayjs(contact.createdAt).format("MMM D, YYYY h:mm A")}</TableCell>
                      <TableCell>{dayjs(contact.updatedAt).format("MMM D, YYYY h:mm A")}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No contacts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} fontSize={14}>
        <Typography>
          Showing {paginatedData.length} of {filtered.length} contacts
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || totalContacts === 0}
          >
            Prev
          </Button>

          <Typography>
            Page {currentPage} of {totalPages}
          </Typography>

          <Button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage * pageSize >= totalContacts}>
            Next
          </Button>
        </Box>
        <FormControl size="small" sx={{ minWidth: 90 }}>
          <InputLabel>Page size</InputLabel>
          <Select
            value={pageSize}
            label="Page size"
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // reset to first page
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Contacts</DialogTitle>
        <DialogContent>
          <Typography>Type DELETE to confirm deletion of selected contacts:</Typography>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={verificationText}
            onChange={(e) => setVerificationText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete} disabled={verificationText !== "DELETE"}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactsTable;
