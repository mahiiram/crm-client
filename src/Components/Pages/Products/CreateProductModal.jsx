import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material";
import { listOpportunityOptions, listUserOptions } from "./productApi";

const emptyForm = { name: "", sku: "", category: "", description: "", price: "", cost: "", currency: "INR", stockQuantity: "0", status: "Active", assignedTo: "", notes: "", opportunityIds: [] };
const grid = { display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 };
const normalize = (form) => ({ ...form, name: form.name.trim(), sku: form.sku.trim().toUpperCase(), assignedTo: form.assignedTo || null, price: form.price === "" ? 0 : Number(form.price), cost: form.cost === "" ? 0 : Number(form.cost), stockQuantity: form.stockQuantity === "" ? 0 : Number(form.stockQuantity) });
const userLabel = (user) => `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email;

export default function CreateProductModal({ open, token, onClose, onSave }) {
  const [form, setForm] = useState(emptyForm);
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!open) { setForm(emptyForm); setError(""); return; }
    let active = true;
    Promise.all([listUserOptions(token), listOpportunityOptions(token)]).then(([userItems, opportunityItems]) => { if (active) { setUsers(userItems); setOpportunities(opportunityItems); } }).catch(() => { if (active) setError("Some association options could not be loaded."); });
    return () => { active = false; };
  }, [open, token]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async () => {
    if (!form.name.trim() || !form.sku.trim()) return setError("Product name and SKU are required.");
    if ([form.price, form.cost, form.stockQuantity].some((value) => value !== "" && Number(value) < 0)) return setError("Price, cost and stock cannot be negative.");
    setSaving(true); setError("");
    try { await onSave(normalize(form)); onClose(); } catch (err) { setError(err?.response?.data?.message || "Unable to create product."); } finally { setSaving(false); }
  };

  return <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 2 } }}>
    <DialogTitle sx={{ px: 4, py: 2.5, color: "#2e7d32", fontSize: 28, fontWeight: 700 }}>Create Product</DialogTitle>
    <DialogContent dividers sx={{ px: 4, py: 3 }}><Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5, fontSize: 14 }}>Product information</Typography>
      <Box sx={grid}>
        <TextField required label="Product name" name="name" value={form.name} onChange={change} sx={{ gridColumn: { sm: "span 2" } }} />
        <TextField required label="SKU" name="sku" value={form.sku} onChange={change} />
        <TextField select label="Status" name="status" value={form.status} onChange={change}>{["Active", "Inactive", "Draft"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField label="Category" name="category" value={form.category} onChange={change} />
        <TextField type="number" label="Selling price" name="price" value={form.price} onChange={change} inputProps={{ min: 0, step: "0.01" }} />
        <TextField type="number" label="Cost" name="cost" value={form.cost} onChange={change} inputProps={{ min: 0, step: "0.01" }} />
        <TextField select label="Currency" name="currency" value={form.currency} onChange={change}>{["INR", "USD", "EUR", "GBP"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
        <TextField type="number" label="Stock quantity" name="stockQuantity" value={form.stockQuantity} onChange={change} inputProps={{ min: 0 }} />
        <TextField select label="Assigned to" name="assignedTo" value={form.assignedTo} onChange={change}><MenuItem value="">Unassigned</MenuItem>{users.map((user) => <MenuItem key={user._id} value={user._id}>{userLabel(user)}</MenuItem>)}</TextField>
        <TextField select label="Associated opportunities" name="opportunityIds" value={form.opportunityIds} onChange={change} SelectProps={{ multiple: true, renderValue: (values) => values.map((id) => opportunities.find((item) => item._id === id)?.title || id).join(", ") }} sx={{ gridColumn: { sm: "span 2" } }}>{opportunities.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}</TextField>
        <TextField multiline minRows={3} label="Description" name="description" value={form.description} onChange={change} sx={{ gridColumn: { sm: "span 2" } }} />
        <TextField multiline minRows={3} label="Notes" name="notes" value={form.notes} onChange={change} sx={{ gridColumn: { sm: "span 2" } }} />
      </Box>{error && <Typography color="error" mt={2}>{error}</Typography>}
    </DialogContent>
    <DialogActions sx={{ px: 4, py: 2.5 }}><Button onClick={onClose} disabled={saving}>Cancel</Button><Button variant="contained" color="success" size="large" onClick={submit} disabled={saving}>{saving ? "Creating…" : "Create Product"}</Button></DialogActions>
  </Dialog>;
}
