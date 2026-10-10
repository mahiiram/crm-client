import { useCallback, useEffect, useState } from "react";
import { Avatar, Box, Button, CircularProgress, Divider, MenuItem, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { ArrowLeft, Edit, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import { toast } from "react-hot-toast";
import { deleteOpportunity, getOpportunityById, listCompanyOptions, listContactOptions, listUserOptions, updateOpportunity } from "./opportunityApi";

const TABS = ["Activities", "Notes", "Associations"];
const STAGES = ["Prospecting", "Proposal", "Negotiation", "Closed-Won", "Closed-Lost"];
const idOf = (value) => typeof value === "object" ? value?._id || "" : value || "";
const toForm = (item = {}) => ({ title: item.title || "", company: idOf(item.company), contact: idOf(item.contact), assignedTo: idOf(item.assignedTo), amount: item.amount ?? "", stage: item.stage || "Prospecting", closeDate: item.closeDate ? dayjs(item.closeDate).format("YYYY-MM-DD") : "", probability: item.probability ?? "", notes: item.notes || "" });
const toPayload = (form) => ({ ...form, company: form.company || null, contact: form.contact || null, assignedTo: form.assignedTo || null, amount: form.amount === "" ? null : Number(form.amount), probability: form.probability === "" ? null : Number(form.probability), closeDate: form.closeDate || null });
const formatDate = (value) => value && dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY h:mm A") : "--";
const contactLabel = (item) => `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || item?.email || "No contact";
const userLabel = (item) => `${item?.firstname || ""} ${item?.lastname || ""}`.trim() || item?.email || "Unassigned";

export default function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [item, setItem] = useState(null);
  const [form, setForm] = useState(toForm());
  const [options, setOptions] = useState({ companies: [], contacts: [], users: [] });
  const [activeTab, setActiveTab] = useState("Activities");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => { setLoading(true); setError(""); try { const response = await getOpportunityById(id, token); const record = response.data?.opportunity; setItem(record); setForm(toForm(record)); } catch (err) { setError(err?.response?.data?.message || "Unable to load opportunity."); } finally { setLoading(false); } }, [id, token]);
  useEffect(() => { if (token) load(); }, [load, token]);
  useEffect(() => { if (!editing) return; Promise.all([listCompanyOptions(token), listContactOptions(token), listUserOptions(token)]).then(([companies, contacts, users]) => setOptions({ companies, contacts, users })).catch(() => setError("Some association options could not be loaded.")); }, [editing, token]);

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const save = async () => { if (!form.title.trim()) return setError("Opportunity title is required."); if (form.probability !== "" && (Number(form.probability) < 0 || Number(form.probability) > 100)) return setError("Probability must be between 0 and 100."); setSaving(true); setError(""); try { await updateOpportunity(id, toPayload(form), token); await load(); setEditing(false); toast.success("Opportunity updated"); } catch (err) { setError(err?.response?.data?.message || "Unable to update opportunity."); } finally { setSaving(false); } };
  const remove = async () => { if (!window.confirm(`Delete ${item?.title || "this opportunity"}?`)) return; try { await deleteOpportunity(id, token); toast.success("Opportunity deleted"); navigate("/opportunities"); } catch (err) { toast.error(err?.response?.data?.message || "Unable to delete opportunity."); } };
  const readField = (name, label, props = {}) => <TextField fullWidth size="small" label={label} name={name} value={form[name]} onChange={change} InputProps={{ readOnly: !editing }} {...props} />;

  if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  if (!item) return <Paper sx={{ p: 4 }}><Typography color="error">{error || "Opportunity not found."}</Typography></Paper>;

  return <Box sx={{ height: { lg: "calc(100vh - 110px)" }, minHeight: 620, bgcolor: "#f3f4f6", p: 1 }}>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "35% 65%" }, gap: 2, height: "100%" }}>
      <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowY: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}><Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/opportunities")}>Back</Button><Stack direction="row" spacing={1}>{editing && <Button variant="outlined" onClick={() => { setForm(toForm(item)); setEditing(false); }}>Cancel</Button>}<Button variant="contained" startIcon={editing ? <Save size={16} /> : <Edit size={16} />} disabled={saving} onClick={editing ? save : () => setEditing(true)}>{editing ? (saving ? "Saving…" : "Save") : "Edit"}</Button><Button color="error" variant="outlined" startIcon={<Trash2 size={16} />} onClick={remove}>Delete</Button></Stack></Stack>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}><Avatar sx={{ width: 58, height: 58, bgcolor: "#374151", fontWeight: 700 }}>OP</Avatar><Box minWidth={0}><Typography variant="h5" fontWeight={700} noWrap>{item.title}</Typography><Typography color="text.secondary">{item.stage}</Typography><Typography variant="body2" color="text.secondary">Updated {formatDate(item.updatedAt)}</Typography></Box></Stack>
        <Divider sx={{ mb: 2 }} /><Typography fontWeight={700} mb={1.5}>Opportunity Information</Typography>
        <Stack spacing={1.5}>{readField("title", "Title")}{editing ? <TextField select fullWidth size="small" label="Stage" name="stage" value={form.stage} onChange={change}>{STAGES.map((stage) => <MenuItem key={stage} value={stage}>{stage}</MenuItem>)}</TextField> : readField("stage", "Stage")}{readField("amount", "Amount", { type: "number" })}{readField("probability", "Probability (%)", { type: "number", inputProps: { min: 0, max: 100 } })}{readField("closeDate", "Close Date", { type: "date", InputLabelProps: { shrink: true } })}
          {editing ? <TextField select fullWidth size="small" label="Company" name="company" value={form.company} onChange={change}><MenuItem value="">No company</MenuItem>{item.company?._id && !options.companies.some((value) => value._id === item.company._id) && <MenuItem value={item.company._id}>{item.company.name}</MenuItem>}{options.companies.map((company) => <MenuItem key={company._id} value={company._id}>{company.name}</MenuItem>)}</TextField> : <TextField fullWidth size="small" label="Company" value={item.company?.name || "No company"} InputProps={{ readOnly: true }} />}
          {editing ? <TextField select fullWidth size="small" label="Contact" name="contact" value={form.contact} onChange={change}><MenuItem value="">No contact</MenuItem>{item.contact?._id && !options.contacts.some((value) => value._id === item.contact._id) && <MenuItem value={item.contact._id}>{contactLabel(item.contact)}</MenuItem>}{options.contacts.map((contact) => <MenuItem key={contact._id} value={contact._id}>{contactLabel(contact)}</MenuItem>)}</TextField> : <TextField fullWidth size="small" label="Contact" value={contactLabel(item.contact)} InputProps={{ readOnly: true }} />}
          {editing ? <TextField select fullWidth size="small" label="Assigned To" name="assignedTo" value={form.assignedTo} onChange={change}><MenuItem value="">Unassigned</MenuItem>{item.assignedTo?._id && !options.users.some((value) => value._id === item.assignedTo._id) && <MenuItem value={item.assignedTo._id}>{userLabel(item.assignedTo)}</MenuItem>}{options.users.map((user) => <MenuItem key={user._id} value={user._id}>{userLabel(user)}</MenuItem>)}</TextField> : <TextField fullWidth size="small" label="Assigned To" value={userLabel(item.assignedTo)} InputProps={{ readOnly: true }} />}
        </Stack>
        <Divider sx={{ my: 2 }} /><Stack direction="row" justifyContent="space-between"><Box><Typography variant="caption" color="text.secondary">Created At</Typography><Typography fontWeight={600}>{formatDate(item.createdAt)}</Typography></Box><Box><Typography variant="caption" color="text.secondary">Updated At</Typography><Typography fontWeight={600}>{formatDate(item.updatedAt)}</Typography></Box></Stack>{error && <Typography color="error" mt={2}>{error}</Typography>}
      </Paper>
      <Box sx={{ overflowY: "auto", pr: 0.5 }}><Paper sx={{ borderRadius: 3, mb: 2, border: "1px solid #e5e7eb" }}><Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>{TABS.map((tab) => <Tab key={tab} value={tab} label={tab} sx={{ textTransform: "none", fontWeight: 700 }} />)}</Tabs></Paper>
        <Paper sx={{ p: 3, borderRadius: 3, border: "1px solid #e5e7eb", minHeight: 150 }}>
          {activeTab === "Activities" && <><Typography variant="h6" fontWeight={700}>Opportunity Activities</Typography><Typography color="text.secondary" mt={2}>No activities yet.</Typography></>}
          {activeTab === "Notes" && <><Typography variant="h6" fontWeight={700} mb={2}>Opportunity Notes</Typography>{editing ? <TextField fullWidth multiline minRows={6} name="notes" value={form.notes} onChange={change} placeholder="Add notes about this opportunity" /> : <Typography color={item.notes ? "text.primary" : "text.secondary"} sx={{ whiteSpace: "pre-wrap" }}>{item.notes || "No notes yet."}</Typography>}</>}
          {activeTab === "Associations" && <><Typography variant="h6" fontWeight={700} mb={2}>Associated Records</Typography><Stack spacing={2}>{item.company ? <Paper variant="outlined" sx={{ p: 2, cursor: "pointer" }} onClick={() => navigate(`/company/${item.company._id}`)}><Typography variant="caption" color="text.secondary">COMPANY</Typography><Typography fontWeight={700}>{item.company.name}</Typography><Typography variant="body2" color="text.secondary">{item.company.email || item.company.domain || "No contact information"}</Typography></Paper> : <Typography color="text.secondary">No company associated.</Typography>}{item.contact ? <Paper variant="outlined" sx={{ p: 2, cursor: "pointer" }} onClick={() => navigate(`/contact/${item.contact._id}`)}><Typography variant="caption" color="text.secondary">CONTACT</Typography><Typography fontWeight={700}>{contactLabel(item.contact)}</Typography><Typography variant="body2" color="text.secondary">{item.contact.email || "No email"}</Typography></Paper> : <Typography color="text.secondary">No contact associated.</Typography>}</Stack></>}
        </Paper>
      </Box>
    </Box>
  </Box>;
}
