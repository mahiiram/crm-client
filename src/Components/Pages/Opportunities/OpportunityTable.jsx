import { useCallback, useEffect, useState } from "react";
import { Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import CreateOpportunityModal from "./CreateOpportunityModal";
import { createOpportunity, deleteOpportunity, listOpportunities } from "./opportunityApi";

const PAGE_SIZES = [25, 50, 100];
const stageColor = (stage) => stage === "Closed-Won" ? "success" : stage === "Closed-Lost" ? "error" : stage === "Negotiation" ? "warning" : "default";
const companyName = (value) => typeof value === "object" ? value?.name : "--";

export default function OpportunityTable({ token }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try { const data = await listOpportunities(token, { page, limit }); setItems(data.opportunities || []); setTotal(data.total || 0); }
    catch (err) { setError(err?.response?.data?.message || "Unable to load opportunities."); }
    finally { setLoading(false); }
  }, [token, page, limit]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelected([]); }, [page, limit]);

  const save = async (data) => { await createOpportunity(data, token); toast.success("Opportunity created"); setPage(1); await load(); };
  const remove = async () => {
    setDeleting(true);
    try { await Promise.all(selected.map((id) => deleteOpportunity(id, token))); toast.success(`${selected.length} opportunit${selected.length === 1 ? "y" : "ies"} deleted`); setSelected([]); setDeleteOpen(false); setConfirmText(""); await load(); }
    catch (err) { toast.error(err?.response?.data?.message || "Unable to delete opportunities."); }
    finally { setDeleting(false); }
  };
  const pages = Math.max(1, Math.ceil(total / limit));
  const allSelected = items.length > 0 && items.every((item) => selected.includes(item._id));

  return <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} gap={2} flexWrap="wrap"><Typography variant="h6" fontWeight="bold" color="success.main">OPPORTUNITIES</Typography><Box display="flex" gap={1}>{selected.length > 0 && <Button color="error" variant="outlined" startIcon={<Delete />} onClick={() => setDeleteOpen(true)}>Delete ({selected.length})</Button>}<Button color="success" variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Create Opportunity</Button></Box></Box>
    {error && <Typography color="error" mb={2}>{error}</Typography>}
    <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 260px)", borderRadius: 3, border: "1px solid #e0e0e0" }}><Table stickyHeader><TableHead><TableRow><TableCell padding="checkbox"><Checkbox checked={allSelected} onChange={(event) => setSelected(event.target.checked ? items.map((item) => item._id) : [])} /></TableCell><TableCell sx={{ fontWeight: 600 }}>Title</TableCell><TableCell sx={{ fontWeight: 600 }}>Company</TableCell><TableCell sx={{ fontWeight: 600 }}>Amount</TableCell><TableCell sx={{ fontWeight: 600 }}>Stage</TableCell><TableCell sx={{ fontWeight: 600 }}>Probability</TableCell><TableCell sx={{ fontWeight: 600 }}>Close Date</TableCell></TableRow></TableHead><TableBody>
      {loading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={28} /></TableCell></TableRow> : items.length ? items.map((item) => <TableRow hover key={item._id} sx={{ cursor: "pointer" }} onClick={() => navigate(`/opportunity/${item._id}`)}><TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}><Checkbox checked={selected.includes(item._id)} onChange={() => setSelected((current) => current.includes(item._id) ? current.filter((id) => id !== item._id) : [...current, item._id])} /></TableCell><TableCell sx={{ fontWeight: 500 }}>{item.title}</TableCell><TableCell>{companyName(item.company)}</TableCell><TableCell>{item.amount == null ? "--" : Number(item.amount).toLocaleString()}</TableCell><TableCell><Chip size="small" label={item.stage || "Prospecting"} color={stageColor(item.stage)} /></TableCell><TableCell>{item.probability == null ? "--" : `${item.probability}%`}</TableCell><TableCell>{item.closeDate ? dayjs(item.closeDate).format("MMM D, YYYY") : "--"}</TableCell></TableRow>) : <TableRow><TableCell colSpan={7} align="center">No opportunities found.</TableCell></TableRow>}
    </TableBody></Table></TableContainer>
    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} gap={2} flexWrap="wrap"><Typography variant="body2">Showing {items.length} of {total} opportunities</Typography><Box display="flex" alignItems="center" gap={1}><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Prev</Button><Typography variant="body2">Page {page} of {pages}</Typography><Button disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</Button></Box><FormControl size="small" sx={{ minWidth: 100 }}><InputLabel>Page size</InputLabel><Select label="Page size" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>{PAGE_SIZES.map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}</Select></FormControl></Box>
    <CreateOpportunityModal open={createOpen} token={token} onClose={() => setCreateOpen(false)} onSave={save} />
    <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}><DialogTitle>Delete Opportunities</DialogTitle><DialogContent><Typography>Type DELETE to permanently delete {selected.length} selected opportunit{selected.length === 1 ? "y" : "ies"}.</Typography><TextField autoFocus fullWidth margin="dense" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} /></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" disabled={confirmText !== "DELETE" || deleting} onClick={remove}>{deleting ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog>
  </Box>;
}
