import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ArrowLeft } from "lucide-react";
import {
  createCompany,
  deleteContact,
  getContactById,
  listCompanies,
  listOpportunities,
  updateContact,
} from "./contactApi";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const TABS = ["Activities", "Notes", "Emails", "Associations"];
const OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;

const toOption = (entity) => {
  if (!entity) return null;
  const id = entity._id || entity.id || "";
  const label =
    entity.name ||
    entity.companyName ||
    entity.opportunityName ||
    entity.title ||
    entity.label ||
    entity.email ||
    id;

  if (!id) return null;
  return { id, label, raw: entity };
};

const resolveAssociationId = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) return resolveAssociationId(value[0]);
  if (typeof value === "object") return value._id || value.id || "";
  if (typeof value === "string" && OBJECT_ID_REGEX.test(value)) return value;
  return "";
};

const resolveAssociationLabel = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) return resolveAssociationLabel(value[0]);
  if (typeof value === "object") {
    return value.name || value.companyName || value.opportunityName || value.title || value.label || value.email || "";
  }
  if (typeof value === "string") return OBJECT_ID_REGEX.test(value) ? "" : value;
  return String(value);
};

const ContactDetails = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { id } = useParams();

  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [activeTab, setActiveTab] = useState("Activities");
  const [error, setError] = useState("");
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [opportunitySearchLoading, setOpportunitySearchLoading] = useState(false);

  const [companyOptions, setCompanyOptions] = useState([]);
  const [opportunityOptions, setOpportunityOptions] = useState([]);
  const [companyInput, setCompanyInput] = useState("");
  const [opportunityInput, setOpportunityInput] = useState("");

  const [draft, setDraft] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    companyId: "",
    companyLabel: "",
    notes: "",
    emailLogin: "",
    opportunityId: "",
    opportunityLabel: "",
  });

  const hydrateDraft = (record) => ({
    firstName: record?.firstName || "",
    lastName: record?.lastName || "",
    email: record?.email || "",
    phone: record?.phone || "",
    position: record?.position || "",
    companyId: resolveAssociationId(record?.company || record?.associatedCompany || record?.companies),
    companyLabel: resolveAssociationLabel(record?.company || record?.associatedCompany || record?.companies),
    notes: record?.notes || "",
    emailLogin: record?.emailLogin || record?.email_login || "",
    opportunityId: resolveAssociationId(record?.opportunity || record?.associatedOpportunity || record?.opportunities),
    opportunityLabel: resolveAssociationLabel(record?.opportunity || record?.associatedOpportunity || record?.opportunities),
  });

  const fullName = `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim();
  const initials = `${contact?.firstName?.[0] || ""}${contact?.lastName?.[0] || ""}`.toUpperCase() || "CT";

  const formatDate = (value) => {
    if (!value) return "--";
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format("MMM D, YYYY h:mm A") : "--";
  };

  const fetchContact = async () => {
    if (!id || !token) {
      setError("Missing contact id or login token.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await getContactById(id, token);
      const contactData = res.data?.contact || res.data;
      setContact(contactData);
      const nextDraft = hydrateDraft(contactData);
      setDraft(nextDraft);
      setCompanyInput(nextDraft.companyLabel || "");
      setOpportunityInput(nextDraft.opportunityLabel || "");
    } catch (err) {
      console.error("Error fetching contact:", err);
      setError(err?.response?.data?.message || "Unable to load contact details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, [id, token]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        setOpportunitySearchLoading(true);
        const opportunities = await listOpportunities(token, opportunityInput.trim());
        if (mounted) {
          setOpportunityOptions((opportunities || []).map(toOption).filter(Boolean));
        }
      } catch (err) {
        if (mounted) {
          console.error("Opportunity fetch failed:", err);
        }
      } finally {
        if (mounted) setOpportunitySearchLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [token, opportunityInput]);

  useEffect(() => {
    if (!token || !isEditing) return;

    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        setCompanySearchLoading(true);
        const companies = await listCompanies(token, companyInput.trim());
        if (mounted) {
          setCompanyOptions((companies || []).map(toOption).filter(Boolean));
        }
      } catch (err) {
        if (mounted) {
          console.error("Company search failed:", err);
        }
      } finally {
        if (mounted) setCompanySearchLoading(false);
      }
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [token, companyInput, isEditing]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const selectedCompany = useMemo(() => {
    if (!draft.companyId && !draft.companyLabel) return null;
    if (draft.companyId) {
      return companyOptions.find((option) => option.id === draft.companyId) || { id: draft.companyId, label: draft.companyLabel || draft.companyId };
    }
    return { id: "", label: draft.companyLabel };
  }, [draft.companyId, draft.companyLabel, companyOptions]);

  const selectedOpportunity = useMemo(() => {
    if (!draft.opportunityId && !draft.opportunityLabel) return null;
    if (draft.opportunityId) {
      return (
        opportunityOptions.find((option) => option.id === draft.opportunityId) ||
        { id: draft.opportunityId, label: draft.opportunityLabel || draft.opportunityId }
      );
    }
    return { id: "", label: draft.opportunityLabel };
  }, [draft.opportunityId, draft.opportunityLabel, opportunityOptions]);

  const handleCreateCompany = async (name) => {
    const trimmed = (name || "").trim();
    if (!trimmed) return;

    try {
      setCreatingCompany(true);
      const created = await createCompany(token, trimmed);
      const createdOption = toOption(created);

      if (!createdOption?.id) {
        toast.error("Company created, but response did not include an id.");
        return;
      }

      setCompanyOptions((prev) => [createdOption, ...prev.filter((option) => option.id !== createdOption.id)]);
      setDraft((prev) => ({ ...prev, companyId: createdOption.id, companyLabel: createdOption.label }));
      setCompanyInput(createdOption.label);
      toast.success("Company created and selected");
    } catch (err) {
      console.error("Create company failed:", err);
      toast.error(err?.response?.data?.message || "Unable to create company");
    } finally {
      setCreatingCompany(false);
    }
  };

  const handleCancelEdit = () => {
    const nextDraft = hydrateDraft(contact);
    setDraft(nextDraft);
    setCompanyInput(nextDraft.companyLabel || "");
    setOpportunityInput(nextDraft.opportunityLabel || "");
    setIsEditing(false);
  };

  const handleEditSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setSaving(true);
    try {
      let companyIdToSave = draft.companyId || "";
      const typedCompanyName = companyInput.trim();

      // If user typed a company name but didn't explicitly click "Create company",
      // auto-create it during save and use the returned id.
      if (!companyIdToSave && typedCompanyName) {
        setCreatingCompany(true);
        const createdCompany = await createCompany(token, typedCompanyName);
        const createdOption = toOption(createdCompany);

        if (!createdOption?.id) {
          toast.error("Company created, but response did not include an id.");
          setSaving(false);
          setCreatingCompany(false);
          return;
        }

        companyIdToSave = createdOption.id;
        setCompanyOptions((prev) => [createdOption, ...prev.filter((option) => option.id !== createdOption.id)]);
        setDraft((prev) => ({ ...prev, companyId: createdOption.id, companyLabel: createdOption.label }));
        setCompanyInput(createdOption.label);
      }

      if (companyIdToSave && !OBJECT_ID_REGEX.test(companyIdToSave)) {
        toast.error("Selected company is invalid. Pick from dropdown or create new.");
        setSaving(false);
        setCreatingCompany(false);
        return;
      }

      if (draft.opportunityId && !OBJECT_ID_REGEX.test(draft.opportunityId)) {
        toast.error("Selected opportunity is invalid.");
        setSaving(false);
        setCreatingCompany(false);
        return;
      }

      const payload = {
        firstName: draft.firstName,
        lastName: draft.lastName,
        email: draft.email,
        phone: draft.phone,
        position: draft.position,
        company: companyIdToSave || null,
      };

      if ("notes" in (contact || {})) payload.notes = draft.notes;
      if ("emailLogin" in (contact || {}) || "email_login" in (contact || {})) payload.emailLogin = draft.emailLogin;
      if ("opportunity" in (contact || {}) || "opportunities" in (contact || {})) payload.opportunity = draft.opportunityId || null;

      await updateContact(id, payload, token);
      setIsEditing(false);
      await fetchContact();
      toast.success("Contact updated");
    } catch (err) {
      console.error("Error updating contact:", err);
      toast.error(err?.response?.data?.message || "Unable to update contact");
    } finally {
      setSaving(false);
      setCreatingCompany(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;
    try {
      await deleteContact(id, token);
      navigate("/contacts");
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const activities = useMemo(() => {
    if (Array.isArray(contact?.activities)) return contact.activities;
    return [];
  }, [contact]);

  const companyAssociation = selectedCompany?.label || draft.companyLabel || "--";
  const opportunityAssociation = selectedOpportunity?.label || draft.opportunityLabel || "--";

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh" flexDirection="column" gap={2}>
        <CircularProgress size={36} />
        <Typography color="text.secondary">Loading contact profile...</Typography>
      </Box>
    );

  if (!contact)
    return (
      <Box p={3}>
        <Paper sx={{ p: 4, borderRadius: 3, border: "1px solid #f3d0d0", background: "#fff7f7" }}>
          <Typography variant="h6" color="error.main">
            {error || "Contact not found"}
          </Typography>
        </Paper>
      </Box>
    );

  const companyHasTypedLabel = companyInput.trim().length > 0;
  const companyExistsByName = companyOptions.some((option) => option.label.toLowerCase() === companyInput.trim().toLowerCase());
  const canCreateCompany = isEditing && companyHasTypedLabel && !companyExistsByName;

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "30% 70%" }, gap: 2, height: "100%" }}>
        <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb", overflowY: "auto" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Button startIcon={<ArrowLeft size={15} />} onClick={() => navigate("/contacts")} sx={{ textTransform: "none" }}>
              Back
            </Button>
            <Stack direction="row" spacing={1}>
              {isEditing && (
                <Button variant="outlined" onClick={handleCancelEdit} sx={{ textTransform: "none" }}>
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={handleEditSave}
                disabled={saving || creatingCompany}
                sx={{ textTransform: "none" }}
              >
                {isEditing ? (saving ? "Saving..." : "Save") : "Edit"}
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} sx={{ textTransform: "none" }}>
                Delete
              </Button>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "#374151", fontWeight: 700 }}>{initials}</Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                {fullName || "Unnamed Contact"}
              </Typography>
              <Typography color="text.secondary">{draft.position || "No position"}</Typography>
              <Typography variant="body2" color="text.secondary">
                Updated {formatDate(contact.updatedAt)}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Typography fontWeight={700} mb={1.5}>
            Contact Information
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              label="First Name"
              name="firstName"
              value={draft.firstName}
              onChange={handleFieldChange}
              InputProps={{ readOnly: !isEditing }}
              size="small"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={draft.lastName}
              onChange={handleFieldChange}
              InputProps={{ readOnly: !isEditing }}
              size="small"
            />
            <TextField
              label="Email"
              name="email"
              value={draft.email}
              onChange={handleFieldChange}
              InputProps={{ readOnly: !isEditing }}
              size="small"
            />
            <TextField
              label="Phone"
              name="phone"
              value={draft.phone}
              onChange={handleFieldChange}
              InputProps={{ readOnly: !isEditing }}
              size="small"
            />
            <TextField
              label="Position"
              name="position"
              value={draft.position}
              onChange={handleFieldChange}
              InputProps={{ readOnly: !isEditing }}
              size="small"
            />

            <Autocomplete
              options={companyOptions}
              value={selectedCompany}
              inputValue={companyInput}
              onInputChange={(_, value) => setCompanyInput(value)}
              onChange={(_, option) => {
                if (!option) {
                  setDraft((prev) => ({ ...prev, companyId: "", companyLabel: companyInput.trim() }));
                  return;
                }
                if (typeof option === "string") {
                  setDraft((prev) => ({ ...prev, companyId: "", companyLabel: option }));
                  setCompanyInput(option);
                  return;
                }
                setDraft((prev) => ({ ...prev, companyId: option.id, companyLabel: option.label }));
                setCompanyInput(option.label);
              }}
              freeSolo
              clearOnBlur={false}
              getOptionLabel={(option) => (typeof option === "string" ? option : option?.label || "")}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              disabled={!isEditing || creatingCompany}
                loading={companySearchLoading}
                filterOptions={(options) => options}
                noOptionsText={companySearchLoading ? "Searching..." : "No company found"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Company"
                    size="small"
                    helperText={isEditing ? "Type company name to search. Create if not found." : ""}
                  />
                )}
              />
            {canCreateCompany && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleCreateCompany(companyInput)}
                disabled={creatingCompany}
                sx={{ alignSelf: "flex-start", textTransform: "none" }}
              >
                {creatingCompany ? "Creating..." : `Create company \"${companyInput.trim()}\"`}
              </Button>
            )}

              <Autocomplete
                options={opportunityOptions}
                value={selectedOpportunity}
                inputValue={opportunityInput}
                onInputChange={(_, value) => setOpportunityInput(value)}
              onChange={(_, option) => {
                if (!option) {
                  setDraft((prev) => ({ ...prev, opportunityId: "", opportunityLabel: "" }));
                  return;
                }
                setDraft((prev) => ({ ...prev, opportunityId: option.id, opportunityLabel: option.label }));
                setOpportunityInput(option.label);
              }}
                getOptionLabel={(option) => option?.label || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={!isEditing}
                loading={opportunitySearchLoading}
                filterOptions={(options) => options}
                noOptionsText={opportunitySearchLoading ? "Searching..." : "No opportunity found"}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Opportunity"
                    size="small"
                    helperText={isEditing ? "Type opportunity name to search and select." : ""}
                  />
                )}
              />
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Created At
              </Typography>
              <Typography fontWeight={600}>{formatDate(contact.createdAt)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Updated At
              </Typography>
              <Typography fontWeight={600}>{formatDate(contact.updatedAt)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Contact ID
              </Typography>
              <Typography fontWeight={600} sx={{ wordBreak: "break-all" }}>
                {contact._id || id}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, overflowY: "auto" }}>
          <Paper sx={{ borderRadius: 3, border: "1px solid #e5e7eb", p: 1 }}>
            <Tabs
              value={activeTab}
              onChange={(_, value) => setActiveTab(value)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ minHeight: 40, ".MuiTab-root": { minHeight: 40, textTransform: "none", fontWeight: 600 } }}
            >
              {TABS.map((tab) => (
                <Tab key={tab} label={tab} value={tab} />
              ))}
            </Tabs>
          </Paper>

          {activeTab === "Activities" && (
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={700} mb={1.5}>
                Contact Activities
              </Typography>
              {activities.length > 0 ? (
                <Stack spacing={1.25}>
                  {activities.map((act, idx) => (
                    <Box
                      key={`${act?.date || "activity"}-${idx}`}
                      sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 1.5, backgroundColor: "#fafafa" }}
                    >
                      <Typography fontWeight={700} sx={{ textTransform: "capitalize" }}>
                        {act?.type || "activity"}
                      </Typography>
                      <Typography color="text.secondary">{act?.note || "No note provided"}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(act?.date)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No activities yet.</Typography>
              )}
            </Paper>
          )}

          {activeTab === "Notes" && (
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={700} mb={1.5}>
                Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={10}
                name="notes"
                label="Contact Notes"
                value={draft.notes}
                onChange={handleFieldChange}
                InputProps={{ readOnly: !isEditing }}
              />
              {!isEditing && (
                <Typography variant="caption" color="text.secondary" mt={1} display="block">
                  Turn on edit mode to update notes.
                </Typography>
              )}
            </Paper>
          )}

          {activeTab === "Emails" && (
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={700} mb={1.5}>
                Email Details
              </Typography>
              <Stack spacing={1.5}>
                <TextField
                  label="Primary Email"
                  name="email"
                  value={draft.email}
                  onChange={handleFieldChange}
                  InputProps={{ readOnly: !isEditing }}
                />
                <TextField
                  label="Email Login"
                  name="emailLogin"
                  value={draft.emailLogin}
                  onChange={handleFieldChange}
                  InputProps={{ readOnly: !isEditing }}
                />
              </Stack>
            </Paper>
          )}

          {activeTab === "Associations" && (
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #e5e7eb" }}>
              <Typography variant="h6" fontWeight={700} mb={1.5}>
                Associations
              </Typography>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Associated Company"
                    value={companyAssociation}
                    InputProps={{ readOnly: true }}
                    helperText={draft.companyId ? `ID: ${draft.companyId}` : "No company linked"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Associated Opportunity"
                    value={opportunityAssociation}
                    InputProps={{ readOnly: true }}
                    helperText={draft.opportunityId ? `ID: ${draft.opportunityId}` : "No opportunity linked"}
                  />
                </Grid>
              </Grid>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContactDetails;
