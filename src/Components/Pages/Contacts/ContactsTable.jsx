import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Filter } from "lucide-react";
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
} from "@mui/material";
import CreateContactModal from "./CreateContactModal";

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const ContactsTable = ({ token }) => {
  const [contacts, setContacts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const handleSave = async (contactData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contacts/`, // 👈 API base URL from .env
        contactData,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      console.log("✅ Contact created:", response.data);

      // Optionally refresh your contact list here
      // fetchContacts();
    } catch (error) {
      console.error("❌ Error creating contact:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/contacts?page=${currentPage}&limit=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const contactsData = res?.data?.contacts || [];
        setContacts(contactsData);
        setFiltered(contactsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching contacts:", err);
        setLoading(false);
      });
  }, [currentPage, pageSize, token]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleFilterByDate = (field) => {
    const sorted = [...filtered].sort((a, b) => new Date(b[field]) - new Date(a[field]));
    setFiltered(sorted);
  };

  return (
    <Box>
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">
          Contacts
        </Typography>
        <Button variant="contained" color="success" startIcon={<Plus size={16} />}>
          Create Contact
        </Button>
      </Box> */}
      <>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            Contacts
          </Typography>
          <Button variant="contained" color="success" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Create Contact
          </Button>
        </Box>
        <CreateContactModal open={open} onClose={() => setOpen(false)} onSave={handleSave} />
      </>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={() => handleFilterByDate("createdAt")} startIcon={<Filter size={14} />}>
            Created Date
          </Button>
          <Button variant="outlined" onClick={() => handleFilterByDate("updatedAt")} startIcon={<Filter size={14} />}>
            Updated Date
          </Button>
        </Box>
      </Box>

      {/* <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
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
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((contact) => (
                <TableRow key={contact._id} hover>
                  <TableCell>{contact.firstName} {contact.lastName}</TableCell>
                  <TableCell>{contact.email || "--"}</TableCell>
                  <TableCell>{contact.phone || "--"}</TableCell>
                  <TableCell>{contact.position || "--"}</TableCell>
                  <TableCell>{dayjs(contact.createdAt).format("MMM D, YYYY h:mm A")}</TableCell>
                  <TableCell>{dayjs(contact.updatedAt).format("MMM D, YYYY h:mm A")}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">No contacts found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer> */}
      <Box sx={{ height: 400, overflow: "auto" }}>
        <TableContainer component={Paper} sx={contacts.length > 0 ? { maxHeight: 100 } : { height: 400 }}>
          <Table stickyHeader size="small" sx={{ height: "100%", tableLayout: "fixed" }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 160 }}>Name</TableCell>
                <TableCell sx={{ width: 220 }}>Email</TableCell>
                <TableCell sx={{ width: 140 }}>Phone</TableCell>
                <TableCell sx={{ width: 160 }}>Position</TableCell>
                <TableCell sx={{ width: 180 }}>Created At</TableCell>
                <TableCell sx={{ width: 180 }}>Updated At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ minHeight: "300px", position: "relative" }}>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((contact) => (
                  <TableRow key={contact._id} hover>
                    <TableCell sx={{ width: 160 }}>
                      {contact.firstName} {contact.lastName}
                    </TableCell>
                    <TableCell sx={{ width: 220 }}>{contact.email || "--"}</TableCell>
                    <TableCell sx={{ width: 140 }}>{contact.phone || "--"}</TableCell>
                    <TableCell sx={{ width: 160 }}>{contact.position || "--"}</TableCell>
                    <TableCell sx={{ width: 180 }}>{dayjs(contact.createdAt).format("MMM D, YYYY h:mm A")}</TableCell>
                    <TableCell sx={{ width: 180 }}>{dayjs(contact.updatedAt).format("MMM D, YYYY h:mm A")}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} sx={contacts.length > 0 ? { maxHeight: 100 } : { height: 400 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                      <div className="flex justify-center items-center h-[300px] text-green-700 text-lg font-medium"></div>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

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
        <FormControl size="=small" sx={{ minWidth: 90 }}>
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
    </Box>
  );
};

export default ContactsTable;
