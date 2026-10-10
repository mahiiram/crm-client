import { useCallback, useEffect, useState } from "react";
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Add, ArrowDownward, ArrowUpward, Delete, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import CreateCompanyModal from "./CreateCompanyModal";
import { createCompany, deleteCompany, listCompanies } from "./companyApi";

const PAGE_SIZES = [25, 50, 100];

export default function CompanyTable({ token }) {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [selected, setSelected] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await listCompanies(token, { page, limit, query: search, orderBy, order });
      setCompanies(data.companies || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load companies.");
    } finally {
      setLoading(false);
    }
  }, [token, page, limit, search, orderBy, order]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelected([]); }, [page, limit]);

  const save = async (data) => {
    await createCompany(data, token);
    toast.success("Company created");
    setPage(1);
    await load();
  };

  const removeSelected = async () => {
    setDeleting(true);
    try {
      await Promise.all(selected.map((id) => deleteCompany(id, token)));
      toast.success(`${selected.length} compan${selected.length === 1 ? "y" : "ies"} deleted`);
      setSelected([]);
      setDeleteOpen(false);
      setConfirmText("");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to delete companies.");
    } finally {
      setDeleting(false);
    }
  };

  const sort = (field, direction) => { setOrderBy(field); setOrder(direction); setPage(1); };
  const pages = Math.max(1, Math.ceil(total / limit));
  const allSelected = companies.length > 0 && companies.every((item) => selected.includes(item._id));

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={2} flexWrap="wrap">
        <Typography variant="h6" fontWeight="bold" color="success.main">COMPANIES</Typography>
        <Box display="flex" gap={1}>
          {selected.length > 0 && <Button color="error" variant="outlined" startIcon={<Delete />} onClick={() => setDeleteOpen(true)}>Delete ({selected.length})</Button>}
          <Button color="success" variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Create Company</Button>
        </Box>
      </Box>
      <Box component="form" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }} display="flex" gap={1} mb={2} maxWidth={480}>
        <TextField fullWidth size="small" label="Search companies" value={query} onChange={(event) => setQuery(event.target.value)} />
        <Button type="submit" variant="outlined" color="success" startIcon={<Search />}>Search</Button>
      </Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 300px)", borderRadius: 3, border: "1px solid #e0e0e0" }}>
        <Table stickyHeader>
          <TableHead><TableRow>
            <TableCell padding="checkbox"><Checkbox checked={allSelected} onChange={(event) => setSelected(event.target.checked ? companies.map((item) => item._id) : [])} /></TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Name</TableCell><TableCell sx={{ fontWeight: 600 }}>Email</TableCell><TableCell sx={{ fontWeight: 600 }}>Phone</TableCell><TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}><Box display="flex" alignItems="center">Created<ArrowUpward fontSize="inherit" color="success" sx={{ cursor: "pointer", ml: 1 }} onClick={() => sort("createdAt", "asc")} /><ArrowDownward fontSize="inherit" color="error" sx={{ cursor: "pointer" }} onClick={() => sort("createdAt", "desc")} /></Box></TableCell>
          </TableRow></TableHead>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={28} /></TableCell></TableRow> : companies.length ? companies.map((company) => (
              <TableRow hover key={company._id} sx={{ cursor: "pointer" }} onClick={() => navigate(`/company/${company._id}`)}>
                <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}><Checkbox checked={selected.includes(company._id)} onChange={() => setSelected((current) => current.includes(company._id) ? current.filter((id) => id !== company._id) : [...current, company._id])} /></TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{company.name}</TableCell><TableCell>{company.email || "--"}</TableCell><TableCell>{company.phone || "--"}</TableCell><TableCell>{company.status || "--"}</TableCell><TableCell>{company.createdAt ? dayjs(company.createdAt).format("MMM D, YYYY h:mm A") : "--"}</TableCell>
              </TableRow>
            )) : <TableRow><TableCell colSpan={6} align="center">No companies found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mt={2} flexWrap="wrap">
        <Typography variant="body2">Showing {companies.length} of {total} companies</Typography>
        <Box display="flex" alignItems="center" gap={1}><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Prev</Button><Typography variant="body2">Page {page} of {pages}</Typography><Button disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</Button></Box>
        <FormControl size="small" sx={{ minWidth: 100 }}><InputLabel>Page size</InputLabel><Select label="Page size" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>{PAGE_SIZES.map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}</Select></FormControl>
      </Box>
      <CreateCompanyModal open={createOpen} token={token} onClose={() => setCreateOpen(false)} onSave={save} />
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}><DialogTitle>Delete Companies</DialogTitle><DialogContent><Typography>Type DELETE to permanently delete {selected.length} selected compan{selected.length === 1 ? "y" : "ies"}.</Typography><TextField autoFocus fullWidth margin="dense" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} /></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" disabled={confirmText !== "DELETE" || deleting} onClick={removeSelected}>{deleting ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog>
    </Box>
  );
}
