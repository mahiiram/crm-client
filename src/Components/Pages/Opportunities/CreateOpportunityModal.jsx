import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { listCompanyOptions, listContactOptions, listUserOptions } from "./opportunityApi";

const STAGES = ["Prospecting", "Proposal", "Negotiation", "Closed-Won", "Closed-Lost"];
const emptyForm = { title: "", company: "", contact: "", assignedTo: "", amount: "", stage: "Prospecting", closeDate: "", probability: "", notes: "" };
const grid = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 };
const payload = (form) => ({ ...form, company: form.company || null, contact: form.contact || null, assignedTo: form.assignedTo || null, amount: form.amount === "" ? null : Number(form.amount), probability: form.probability === "" ? null : Number(form.probability), closeDate: form.closeDate || null });

export default function CreateOpportunityModal({ open, token, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [options, setOptions] = useState({ companies: [], contacts: [], users: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) { setForm(emptyForm); setError(""); return; }
    let active = true;
    Promise.all([listCompanyOptions(token), listContactOptions(token), listUserOptions(token)]).then(([companies, contacts, users]) => { if (active) setOptions({ companies, contacts, users }); }).catch(() => { if (active) setError("Some association options could not be loaded."); });
    return () => { active = false; };
  }, [open, token]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async () => {
    if (!form.title.trim()) return setError("Opportunity title is required.");
    if (form.probability !== "" && (Number(form.probability) < 0 || Number(form.probability) > 100)) return setError("Probability must be between 0 and 100.");
    setSaving(true); setError("");
    try { await onSave(payload({ ...form, title: form.title.trim() })); onClose(); }
    catch (err) { setError(err?.response?.data?.message || "Unable to create opportunity."); }
    finally { setSaving(false); }
  };
  const contactLabel = (item) => `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email;
  const userLabel = (item) => `${item.firstname || ""} ${item.lastname || ""}`.trim() || item.email;

  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ px: 4, py: 2.5, color: "#2e7d32", fontSize: 28, fontWeight: 700 }}>Create Opportunity</DialogTitle>
    <DialogContent dividers sx={{ px: 4, py: 3 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5, fontSize: 14 }}>Deal information and associations</Typography>
      <Box sx={grid}>
        <TextField required label="Title" name="title" value={form.title} onChange={change} sx={{ gridColumn: { sm: "span 2" } }} />
        <TextField select label="Stage" name="stage" value={form.stage} onChange={change}>{STAGES.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField select label="Assigned to" name="assignedTo" value={form.assignedTo} onChange={change}><MenuItem value="">Unassigned</MenuItem>{options.users.map((item) => <MenuItem key={item._id} value={item._id}>{userLabel(item)}</MenuItem>)}</TextField>
        <TextField select label="Company" name="company" value={form.company} onChange={change}><MenuItem value="">No company</MenuItem>{options.companies.map((item) => <MenuItem key={item._id} value={item._id}>{item.name}</MenuItem>)}</TextField>
        <TextField select label="Contact" name="contact" value={form.contact} onChange={change}><MenuItem value="">No contact</MenuItem>{options.contacts.map((item) => <MenuItem key={item._id} value={item._id}>{contactLabel(item)}</MenuItem>)}</TextField>
        <TextField type="number" label="Amount" name="amount" value={form.amount} onChange={change} inputProps={{ min: 0, step: "0.01" }} />
        <TextField type="number" label="Probability (%)" name="probability" value={form.probability} onChange={change} inputProps={{ min: 0, max: 100 }} />
        <TextField type="date" label="Close date" name="closeDate" value={form.closeDate} onChange={change} InputLabelProps={{ shrink: true }} />
        <TextField multiline minRows={3} label="Notes" name="notes" value={form.notes} onChange={change} sx={{ gridColumn: { sm: "span 2", lg: "span 3" } }} />
      </Box>
      {error && <Typography color="error" variant="body2" mt={2}>{error}</Typography>}
    </DialogContent>
    <DialogActions sx={{ px: 4, py: 2.5 }}><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" color="success" size="large" onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create Opportunity"}</Button></DialogActions>
  </Dialog>;
}
