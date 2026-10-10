import { useCallback, useEffect, useState } from "react";
import { Avatar, Box, Button, CircularProgress, Divider, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { ArrowLeft, Building2, Edit, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { deleteCompany, getCompanyById, listUserOptions, updateCompany } from "./companyApi";

const TABS = ["Activities", "Notes", "Associations"];
const toForm = (company = {}) => ({ name: company.name || "", industry: company.industry || "", email: company.email || "", phone: company.phone || "", website: company.website || "", domain: company.domain || "", status: company.status || "Lead", assignedTo: company.assignedTo?._id || company.assignedTo || "", notes: company.notes || "", address: { street: company.address?.street || "", city: company.address?.city || "", state: company.address?.state || "", zip: company.address?.zip || "", country: company.address?.country || "" } });
const formatDate = (value) => value && dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY h:mm A") : "--";
const userLabel = (user) => `${user?.firstname || ""} ${user?.lastname || ""}`.trim() || user?.email || "Unassigned";

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [company, setCompany] = useState(null);
  const [associations, setAssociations] = useState({ contacts: [], opportunities: [] });
  const [form, setForm] = useState(toForm());
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("Activities");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await getCompanyById(id, token); const record = response.data?.company; setCompany(record); setAssociations(response.data?.associations || { contacts: [], opportunities: [] }); setForm(toForm(record)); }
    catch (err) { setError(err?.response?.data?.message || "Unable to load company."); }
    finally { setLoading(false); }
  }, [id, token]);
  useEffect(() => { if (token) load(); }, [load, token]);
  useEffect(() => { if (editing) listUserOptions(token).then(setUsers).catch(() => setError("Assignees could not be loaded.")); }, [editing, token]);

  const change = (event) => { const { name, value } = event.target; if (name.startsWith("address.")) { const key = name.split(".")[1]; setForm((current) => ({ ...current, address: { ...current.address, [key]: value } })); } else setForm((current) => ({ ...current, [name]: value })); };
  const save = async () => { if (!form.name.trim()) return setError("Company name is required."); setSaving(true); setError(""); try { await updateCompany(id, { ...form, assignedTo: form.assignedTo || null }, token); await load(); setEditing(false); toast.success("Company updated"); } catch (err) { setError(err?.response?.data?.message || "Unable to update company."); } finally { setSaving(false); } };
  const remove = async () => { if (!window.confirm(`Delete ${company?.name || "this company"}? Associated records will be kept and unlinked.`)) return; try { await deleteCompany(id, token); toast.success("Company deleted"); navigate("/companies"); } catch (err) { toast.error(err?.response?.data?.message || "Unable to delete company."); } };
  const initials = company?.name?.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "CO";
  const field = (name, label, props = {}) => <TextField fullWidth size="small" label={label} name={name} value={name.startsWith("address.") ? form.address[name.split(".")[1]] : form[name]} onChange={change} InputProps={{ readOnly: !editing }} {...props} />;

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  if (!company) return <Paper sx={{ p: 4 }}><Typography color="error">{error || "Company not found."}</Typography></Paper>;

  return <Box sx={{ height: { lg: "calc(100vh - 110px)" }, minHeight: 620, bgcolor: "#f3f4f6", p: 1 }}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "35% 65%" }, gap: 2, height: "100%" }}>
      <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowY: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}><Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/companies")}>Back</Button><Stack direction="row" spacing={1}>{editing && <Button variant="outlined" onClick={() => { setForm(toForm(company)); setEditing(false); }}>Cancel</Button>}<Button variant="contained" startIcon={editing ? <Save size={16} /> : <Edit size={16} />} disabled={saving} onClick={editing ? save : () => setEditing(true)}>{editing ? (saving ? "Saving…" : "Save") : "Edit"}</Button><Button color="error" variant="outlined" startIcon={<Trash2 size={16} />} onClick={remove}>Delete</Button></Stack></Stack>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}><Avatar sx={{ width: 58, height: 58, bgcolor: "#374151", fontWeight: 700 }}>{initials}</Avatar><Box minWidth={0}><Typography variant="h5" fontWeight={700} noWrap>{company.name}</Typography><Typography color="text.secondary">{company.industry || "No industry"}</Typography><Typography variant="body2" color="text.secondary">Updated {formatDate(company.updatedAt || company.createdAt)}</Typography></Box></Stack>
        <Divider sx={{ mb: 2 }} /><Typography fontWeight={700} mb={1.5}>Company Information</Typography>
        <Stack spacing={1.5}>{field("name", "Company Name")}{editing ? <TextField select fullWidth size="small" label="Status" name="status" value={form.status} onChange={change}>{["Active", "Inactive", "Lead"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField> : field("status", "Status")}{field("industry", "Industry")}{field("email", "Email", { type: "email" })}{field("phone", "Phone")}{field("website", "Website")}{field("domain", "Domain")}{editing ? <TextField select fullWidth size="small" label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={change}><MenuItem value="">Unassigned</MenuItem>{company.assignedTo?._id && !users.some((user) => user._id === company.assignedTo._id) && <MenuItem value={company.assignedTo._id}>{userLabel(company.assignedTo)}</MenuItem>}{users.map((user) => <MenuItem key={user._id} value={user._id}>{userLabel(user)}</MenuItem>)}</TextField> : <TextField fullWidth size="small" label="Assigned To" value={userLabel(company.assignedTo)} InputProps={{ readOnly: true }} />}
          <Typography fontWeight={700} pt={1}>Address</Typography>{field("address.street", "Street")}{field("address.city", "City")}{field("address.state", "State")}{field("address.zip", "ZIP / Postal Code")}{field("address.country", "Country")}
        </Stack>
        <Divider sx={{ my: 2 }} /><Stack direction="row" justifyContent="space-between"><Box><Typography variant="caption" color="text.secondary">Created At</Typography><Typography fontWeight={600}>{formatDate(company.createdAt)}</Typography></Box><Box><Typography variant="caption" color="text.secondary">Updated At</Typography><Typography fontWeight={600}>{formatDate(company.updatedAt)}</Typography></Box></Stack>{error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      <Box sx={{ overflowY: "auto", pr: 0.5 }}><Paper sx={{ borderRadius: 3, mb: 2, border: "1px solid #e5e7eb" }}><Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>{TABS.map((tab) => <Tab key={tab} value={tab} label={tab} sx={{ textTransform: "none", fontWeight: 700 }} />)}</Tabs></Paper>
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", minHeight: 150 }}>
          {activeTab === "Activities" && <><Typography variant="h6" fontWeight={700}>Company Activities</Typography><Typography color="text.secondary" mt={2}>No activities yet.</Typography></>}
          {activeTab === "Notes" && <><Typography variant="h6" fontWeight={700} mb={2}>Company Notes</Typography>{editing ? <TextField fullWidth multiline minRows={6} name="notes" value={form.notes} onChange={change} placeholder="Add notes about this company" /> : <Typography color={company.notes ? "text.primary" : "text.secondary"} sx={{ whiteSpace: "pre-wrap" }}>{company.notes || "No notes yet."}</Typography>}</>}
          {activeTab === "Associations" && <><Typography variant="h6" fontWeight={700} mb={2}>Associated Records</Typography><Typography fontWeight={700} mb={1}>Contacts ({associations.contacts.length})</Typography><Stack spacing={1} mb={3}>{associations.contacts.length ? associations.contacts.map((contact) => <Paper variant="outlined" key={contact._id} sx={{ p: 1.5, cursor: "pointer" }} onClick={() => navigate(`/contact/${contact._id}`)}><Typography fontWeight={600}>{`${contact.firstName || ""} ${contact.lastName || ""}`.trim()}</Typography><Typography variant="body2" color="text.secondary">{contact.email || "No email"}</Typography></Paper>) : <Typography color="text.secondary">No associated contacts.</Typography>}</Stack><Typography fontWeight={700} mb={1}>Opportunities ({associations.opportunities.length})</Typography><Stack spacing={1}>{associations.opportunities.length ? associations.opportunities.map((opportunity) => <Paper variant="outlined" key={opportunity._id} sx={{ p: 1.5, cursor: "pointer" }} onClick={() => navigate(`/opportunity/${opportunity._id}`)}><Typography fontWeight={600}>{opportunity.title}</Typography><Typography variant="body2" color="text.secondary">{opportunity.stage} · {opportunity.amount == null ? "No amount" : Number(opportunity.amount).toLocaleString()}</Typography></Paper>) : <Typography color="text.secondary">No associated opportunities.</Typography>}</Stack></>}
        </Paper>
      </Box>
    </Box>
  </Box>;
}
