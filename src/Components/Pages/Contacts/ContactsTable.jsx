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

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/contacts?page=${currentPage}&limit=${pageSize}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const contactsData = res.data.contacts || [];
      setContacts(contactsData);
      setFiltered(contactsData);
    } catch (err) {
      console.error("Error fetching contacts:", err);
    } finally {
      setLoading(false);
    }
  };
  console.log("contacts", token);

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

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Sorting by date
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

  // Batch delete
  console.log("selectedcontact", selectedContacts);
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

      <Box
        sx={{
          height: "100%", // full height of parent
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            flex: 1, // takes remaining height
            overflowY: "auto", // scroll when content overflows
          }}
          //sx={{ maxHeight: 400 }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedContacts.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Updated At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((contact) => (
                  <TableRow
                    key={contact._id}
                    hover
                    onClick={(e) => {
                      // prevent row click if checkbox clicked
                      if (e.target.type !== "checkbox") navigate(`/contact/${contact._id}`);
                    }}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedContacts.includes(contact._id)}
                        onChange={() => handleSelectOne(contact._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                    <TableCell>
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell>{contact.email || "--"}</TableCell>
                    <TableCell>{contact.phone || "--"}</TableCell>
                    <TableCell>{contact.position || "--"}</TableCell>
                    <TableCell>{dayjs(contact.createdAt).format("MMM D, YYYY h:mm A")}</TableCell>
                    <TableCell>{dayjs(contact.updatedAt).format("MMM D, YYYY h:mm A")}</TableCell>
                  </TableRow>
                ))
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
            disabled={currentPage === 1}
            variant="outlined"
            size="small"
          >
            Prev
          </Button>
          <Typography>
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outlined"
            size="small"
          >
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
              setCurrentPage(1);
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
