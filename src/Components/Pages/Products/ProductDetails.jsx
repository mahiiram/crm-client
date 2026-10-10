import { useCallback, useEffect, useState } from "react";
import { Avatar, Box, Button, CircularProgress, Divider, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { ArrowLeft, Edit, Package, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { deleteProduct, getProductById, listOpportunityOptions, listUserOptions, updateProduct } from "./productApi";

const TABS = ["Activities", "Notes", "Associations"];
const toForm = (item = {}, opportunities = []) => ({ name: item.name || "", sku: item.sku || "", category: item.category || "", description: item.description || "", price: item.price ?? "", cost: item.cost ?? "", currency: item.currency || "INR", stockQuantity: item.stockQuantity ?? 0, status: item.status || "Active", assignedTo: item.assignedTo?._id || item.assignedTo || "", notes: item.notes || "", opportunityIds: opportunities.map((value) => value._id) });
const formatDate = (value) => value && dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY h:mm A") : "--";
const userLabel = (user) => `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || user?.email || "Unassigned";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [product, setProduct] = useState(null);
  const [associations, setAssociations] = useState({ opportunities: [] });
  const [form, setForm] = useState(toForm());
  const [users, setUsers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState("Activities");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await getProductById(id, token); const record = response.data?.product; const related = response.data?.associations || { opportunities: [] }; setProduct(record); setAssociations(related); setForm(toForm(record, related.opportunities)); } catch (err) { setError(err?.response?.data?.message || "Unable to load product."); } finally { setLoading(false); } }, [id, token]);
  useEffect(() => { if (token) load(); }, [load, token]);
  useEffect(() => { if (!editing) return; Promise.all([listUserOptions(token), listOpportunityOptions(token)]).then(([userItems, opportunityItems]) => { setUsers(userItems); setOpportunities(opportunityItems); }).catch(() => setError("Some association options could not be loaded.")); }, [editing, token]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = async () => {
    if (!form.name.trim() || !form.sku.trim()) return setError("Product name and SKU are required.");
    if ([form.price, form.cost, form.stockQuantity].some((value) => value !== "" && Number(value) < 0)) return setError("Price, cost and stock cannot be negative.");
    setSaving(true); setError("");
    try { await updateProduct(id, { ...form, name: form.name.trim(), sku: form.sku.trim().toUpperCase(), assignedTo: form.assignedTo || null, price: Number(form.price || 0), cost: Number(form.cost || 0), stockQuantity: Number(form.stockQuantity || 0) }, token); await load(); setEditing(false); toast.success("Product updated"); } catch (err) { setError(err?.response?.data?.message || "Unable to update product."); } finally { setSaving(false); }
  };
  const remove = async () => { if (!window.confirm(`Delete ${product?.name || "this product"}? Opportunity associations will be removed.`)) return; try { await deleteProduct(id, token); toast.success("Product deleted"); navigate("/products"); } catch (err) { toast.error(err?.response?.data?.message || "Unable to delete product."); } };
  const field = (name, label, props = {}) => <TextField fullWidth size="small" label={label} name={name} value={form[name]} onChange={change} InputProps={{ readOnly: !editing }} {...props} />;

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  if (!product) return <Paper sx={{ p: 4 }}><Typography color="error">{error || "Product not found."}</Typography></Paper>;

  return <Box sx={{ height: { lg: "calc(100vh - 110px)" }, minHeight: 620, bgcolor: "#f3f4f6", p: 1 }}><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "35% 65%" }, gap: 2, height: "100%" }}>
    <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowY: "auto" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}><Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/products")}>Back</Button><Stack direction="row" spacing={1}>{editing && <Button variant="outlined" onClick={() => { setForm(toForm(product, associations.opportunities)); setEditing(false); }}>Cancel</Button>}<Button variant="contained" startIcon={editing ? <Save size={16} /> : <Edit size={16} />} disabled={saving} onClick={editing ? save : () => setEditing(true)}>{editing ? (saving ? "Saving…" : "Save") : "Edit"}</Button><Button color="error" variant="outlined" startIcon={<Trash2 size={16} />} onClick={remove}>Delete</Button></Stack></Stack>
      <Stack direction="row" spacing={2} alignItems="center" mb={2}><Avatar sx={{ width: 58, height: 58, bgcolor: "#374151" }}><Package /></Avatar><Box minWidth={0}><Typography variant="h5" fontWeight={700} noWrap>{product.name}</Typography><Typography color="text.secondary">{product.sku} · {product.status}</Typography><Typography variant="body2" color="text.secondary">Updated {formatDate(product.updatedAt)}</Typography></Box></Stack>
      <Divider sx={{ mb: 2 }} /><Typography fontWeight={700} mb={1.5}>Product Information</Typography><Stack spacing={1.5}>{field("name", "Product Name")}{field("sku", "SKU")}{field("category", "Category")}{editing ? <TextField select fullWidth size="small" label="Status" name="status" value={form.status} onChange={change}>{["Active", "Inactive", "Draft"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField> : field("status", "Status")}{field("price", "Selling Price", { type: "number" })}{field("cost", "Cost", { type: "number" })}{editing ? <TextField select fullWidth size="small" label="Currency" name="currency" value={form.currency} onChange={change}>{["INR", "USD", "EUR", "GBP"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField> : field("currency", "Currency")}{field("stockQuantity", "Stock Quantity", { type: "number" })}
        {editing ? <TextField select fullWidth size="small" label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={change}><MenuItem value="">Unassigned</MenuItem>{product.assignedTo?._id && !users.some((user) => user._id === product.assignedTo._id) && <MenuItem value={product.assignedTo._id}>{userLabel(product.assignedTo)}</MenuItem>}{users.map((user) => <MenuItem key={user._id} value={user._id}>{userLabel(user)}</MenuItem>)}</TextField> : <TextField fullWidth size="small" label="Assigned To" value={userLabel(product.assignedTo)} InputProps={{ readOnly: true }} />}{field("description", "Description", { multiline: true, minRows: 3 })}</Stack>
      <Divider sx={{ my: 2 }} /><Stack direction="row" justifyContent="space-between"><Box><Typography variant="caption" color="text.secondary">Created At</Typography><Typography fontWeight={600}>{formatDate(product.createdAt)}</Typography></Box><Box><Typography variant="caption" color="text.secondary">Updated At</Typography><Typography fontWeight={600}>{formatDate(product.updatedAt)}</Typography></Box></Stack>{error && <Typography color="error" mt={2}>{error}</Typography>}
    </Paper>
    <Box sx={{ overflowY: "auto", pr: 0.5 }}><Paper sx={{ borderRadius: 3, mb: 2, border: "1px solid #e5e7eb" }}><Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>{TABS.map((tab) => <Tab key={tab} value={tab} label={tab} sx={{ textTransform: "none", fontWeight: 700 }} />)}</Tabs></Paper><Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", minHeight: 150 }}>
      {activeTab === "Activities" && <><Typography variant="h6" fontWeight={700}>Product Activities</Typography><Typography color="text.secondary" mt={2}>No activities yet.</Typography></>}
      {activeTab === "Notes" && <><Typography variant="h6" fontWeight={700} mb={2}>Product Notes</Typography>{editing ? <TextField fullWidth multiline minRows={6} name="notes" value={form.notes} onChange={change} placeholder="Add notes about this product" /> : <Typography color={product.notes ? "text.primary" : "text.secondary"} sx={{ whiteSpace: "pre-wrap" }}>{product.notes || "No notes yet."}</Typography>}</>}
      {activeTab === "Associations" && <><Typography variant="h6" fontWeight={700} mb={2}>Associated Opportunities</Typography>{editing && <TextField select fullWidth label="Opportunities" name="opportunityIds" value={form.opportunityIds} onChange={change} SelectProps={{ multiple: true, renderValue: (values) => values.map((value) => opportunities.find((item) => item._id === value)?.title || associations.opportunities.find((item) => item._id === value)?.title || value).join(", ") }} sx={{ mb: 2 }}>{opportunities.map((item) => <MenuItem key={item._id} value={item._id}>{item.title}</MenuItem>)}</TextField>}<Stack spacing={1}>{associations.opportunities.length ? associations.opportunities.map((item) => <Paper variant="outlined" key={item._id} sx={{ p: 1.5, cursor: "pointer" }} onClick={() => navigate("/opportunities")}><Typography fontWeight={700}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.stage} · {item.company?.name || "No company"}</Typography></Paper>) : <Typography color="text.secondary">No associated opportunities.</Typography>}</Stack></>}
    </Paper></Box>
  </Box></Box>;
}
