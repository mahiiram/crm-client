import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { listUserOptions } from "./companyApi";

const emptyForm = { name: "", industry: "", website: "", domain: "", phone: "", email: "", status: "Lead", assignedTo: "", notes: "", address: { street: "", city: "", state: "", zip: "", country: "" } };
const grid = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 };

export default function CreateCompanyModal({ open, token, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) { setForm(emptyForm); setError(""); return; }
    let active = true;
    listUserOptions(token).then((items) => { if (active) setUsers(items); }).catch(() => { if (active) setError("Assignee options could not be loaded."); });
    return () => { active = false; };
  }, [open, token]);

  const change = (event) => {
    const { name, value } = event.target;
    if (name.startsWith("address.")) { const key = name.split(".")[1]; setForm((current) => ({ ...current, address: { ...current.address, [key]: value } })); }
    else setForm((current) => ({ ...current, [name]: value }));
  };
  const submit = async () => {
    if (!form.name.trim()) return setError("Company name is required.");
    setSaving(true); setError("");
    try { await onSave({ ...form, name: form.name.trim(), assignedTo: form.assignedTo || null }); onClose(); }
    catch (err) { setError(err?.response?.data?.message || "Unable to create company."); }
    finally { setSaving(false); }
  };
  const userLabel = (user) => `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email;

  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ px: 4, py: 2.5, color: "#2e7d32", fontSize: 28, fontWeight: 700 }}>Create Company</DialogTitle>
    <DialogContent dividers sx={{ px: 4, py: 3 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5, fontSize: 14 }}>Company information</Typography>
      <Box sx={grid}>
        <TextField required label="Company name" name="name" value={form.name} onChange={change} />
        <TextField select label="Status" name="status" value={form.status} onChange={change}>{["Active", "Inactive", "Lead"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField label="Industry" name="industry" value={form.industry} onChange={change} />
        <TextField select label="Assigned to" name="assignedTo" value={form.assignedTo} onChange={change}><MenuItem value="">Unassigned</MenuItem>{users.map((user) => <MenuItem key={user._id} value={user._id}>{userLabel(user)}</MenuItem>)}</TextField>
        <TextField type="email" label="Email" name="email" value={form.email} onChange={change} />
        <TextField label="Phone" name="phone" value={form.phone} onChange={change} />
        <TextField label="Website" name="website" value={form.website} onChange={change} />
        <TextField label="Domain" name="domain" value={form.domain} onChange={change} />
        <Typography variant="overline" color="text.secondary" sx={{ gridColumn: "1 / -1", mt: 1, fontSize: 14 }}>Address</Typography>
        <TextField label="Street" name="address.street" value={form.address.street} onChange={change} sx={{ gridColumn: { sm: "span 2" } }} />
        <TextField label="City" name="address.city" value={form.address.city} onChange={change} />
        <TextField label="State" name="address.state" value={form.address.state} onChange={change} />
        <TextField label="ZIP / postal code" name="address.zip" value={form.address.zip} onChange={change} />
        <TextField label="Country" name="address.country" value={form.address.country} onChange={change} />
        <TextField multiline minRows={2} label="Notes" name="notes" value={form.notes} onChange={change} sx={{ gridColumn: { sm: "span 2" } }} />
      </Box>
      {error && <Typography color="error" variant="body2" mt={2}>{error}</Typography>}
    </DialogContent>
    <DialogActions sx={{ px: 4, py: 2.5 }}><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" color="success" size="large" onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create Company"}</Button></DialogActions>
  </Dialog>;
}
