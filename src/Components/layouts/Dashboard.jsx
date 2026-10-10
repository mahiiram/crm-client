import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, LinearProgress, Paper, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Building2, CheckCircle2, CircleDollarSign, Clock3, Package, RefreshCw, Target, TrendingUp, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getDashboardMetrics } from "./dashboardApi";

const STAGE_COLORS = { Prospecting: "#2563eb", Proposal: "#7c3aed", Negotiation: "#f59e0b", "Closed-Won": "#16a34a", "Closed-Lost": "#dc2626" };
const chipColor = (stage) => stage === "Closed-Won" ? "success" : stage === "Closed-Lost" ? "error" : stage === "Negotiation" ? "warning" : "default";
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: Number(value) >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(Number(value || 0));
const number = (value) => new Intl.NumberFormat().format(Number(value || 0));

function MetricCard({ title, value, helper, icon, accent = "#2563eb" }) {
  return <Paper sx={{ p: 2.25, borderRadius: 3, border: "1px solid #e5e7eb", boxShadow: "0 2px 10px rgba(15,23,42,.04)" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start"><Box><Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography><Typography variant="h4" fontWeight={800} mt={0.5}>{value}</Typography><Typography variant="caption" color="text.secondary">{helper}</Typography></Box><Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: "grid", placeItems: "center", color: accent, bgcolor: `${accent}14` }}>{icon}</Box></Stack>
  </Paper>;
}

function CountCard({ label, value, icon, onClick }) {
  return <Paper onClick={onClick} sx={{ p: 1.75, borderRadius: 2.5, border: "1px solid #e5e7eb", cursor: "pointer", transition: ".2s", "&:hover": { borderColor: "#86efac", transform: "translateY(-2px)" } }}><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ color: "success.main", display: "flex" }}>{icon}</Box><Box><Typography variant="h6" fontWeight={800}>{number(value)}</Typography><Typography variant="caption" color="text.secondary">{label}</Typography></Box></Stack></Paper>;
}

export default function Dashboard() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (background = false) => {
    if (!token) return;
    background ? setRefreshing(true) : setLoading(true);
    setError("");
    try { setData(await getDashboardMetrics(token)); }
    catch (err) { setError(err?.response?.data?.message || "Unable to load dashboard metrics."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const trend = useMemo(() => {
    const source = data?.monthlyWins || [];
    return Array.from({ length: 6 }, (_, index) => {
      const date = dayjs().subtract(5 - index, "month");
      const found = source.find((item) => item._id?.year === date.year() && item._id?.month === date.month() + 1);
      return { label: date.format("MMM"), value: found?.value || 0, count: found?.count || 0 };
    });
  }, [data]);
  const maxTrend = Math.max(...trend.map((item) => item.value), 1);
  const performance = data?.performance || {};
  const counts = data?.counts || {};
  const firstName = user?.firstname || user?.firstName || user?.email?.split("@")[0] || "there";

  return <Box sx={{ maxWidth: 1500, mx: "auto", pb: 4 }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} gap={2} mb={3}><Box><Typography variant="h4" fontWeight={800}>Sales Dashboard</Typography><Typography color="text.secondary">Welcome back, {firstName}. Here’s how your CRM pipeline is performing.</Typography></Box><Button variant="outlined" color="success" startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshCw size={16} />} disabled={refreshing} onClick={() => load(true)}>Refresh</Button></Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => load()}>Retry</Button>}>{error}</Alert>}

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 2, mb: 2 }}>
      {loading ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="rounded" height={130} />) : <>
        <MetricCard title="Opportunity Win Rate" value={`${performance.winRate || 0}%`} helper={`${performance.won || 0} won of ${performance.closed || 0} closed`} icon={<Target size={23} />} accent="#16a34a" />
        <MetricCard title="Open Pipeline Value" value={money(performance.pipelineValue)} helper="All active opportunities" icon={<CircleDollarSign size={23} />} accent="#2563eb" />
        <MetricCard title="Weighted Forecast" value={money(performance.forecastValue)} helper="Value adjusted by probability" icon={<TrendingUp size={23} />} accent="#7c3aed" />
        <MetricCard title="Average Won Deal" value={money(performance.averageWonDeal)} helper={`${money(performance.wonValue)} total won value`} icon={<CheckCircle2 size={23} />} accent="#f59e0b" />
      </>}
    </Box>

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1.5, mb: 2 }}>
      <CountCard label="Companies" value={counts.companies} icon={<Building2 size={21} />} onClick={() => navigate("/companies")} /><CountCard label="Contacts" value={counts.contacts} icon={<Users size={21} />} onClick={() => navigate("/contacts")} /><CountCard label="Opportunities" value={counts.opportunities} icon={<Target size={21} />} onClick={() => navigate("/opportunities")} /><CountCard label="Products" value={counts.products} icon={<Package size={21} />} onClick={() => navigate("/products")} />
    </Box>

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.45fr) minmax(300px, .55fr)" }, gap: 2, mb: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}><Stack direction="row" justifyContent="space-between" mb={2}><Box><Typography variant="h6" fontWeight={800}>Pipeline by Stage</Typography><Typography variant="body2" color="text.secondary">Opportunity volume and value across your funnel</Typography></Box><Chip size="small" label={`${counts.opportunities || 0} total`} /></Stack><Stack spacing={2}>{(data?.stages || []).map((stage) => { const percent = counts.opportunities ? (stage.count / counts.opportunities) * 100 : 0; return <Box key={stage.stage}><Stack direction="row" justifyContent="space-between" mb={0.75}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: STAGE_COLORS[stage.stage] }} /><Typography variant="body2" fontWeight={700}>{stage.stage}</Typography><Typography variant="caption" color="text.secondary">{stage.count} deals</Typography></Stack><Typography variant="body2" fontWeight={700}>{money(stage.value)}</Typography></Stack><LinearProgress variant="determinate" value={percent} sx={{ height: 9, borderRadius: 8, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: STAGE_COLORS[stage.stage], borderRadius: 8 } }} /></Box>; })}</Stack></Paper>
      <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}><Typography variant="h6" fontWeight={800}>Closed Deal Ratio</Typography><Typography variant="body2" color="text.secondary">Won versus lost opportunities</Typography><Box sx={{ position: "relative", width: 190, height: 190, borderRadius: "50%", mx: "auto", my: 3, background: performance.closed ? `conic-gradient(#16a34a 0 ${performance.winRate}%, #ef4444 ${performance.winRate}% 100%)` : "#e5e7eb", display: "grid", placeItems: "center" }}><Box sx={{ width: 130, height: 130, borderRadius: "50%", bgcolor: "white", display: "grid", placeItems: "center", textAlign: "center" }}><Box><Typography variant="h4" fontWeight={800}>{performance.winRate || 0}%</Typography><Typography variant="caption" color="text.secondary">WIN RATE</Typography></Box></Box></Box><Stack direction="row" justifyContent="center" spacing={3}><Typography variant="body2"><Box component="span" sx={{ color: "#16a34a" }}>●</Box> Won {performance.won || 0}</Typography><Typography variant="body2"><Box component="span" sx={{ color: "#ef4444" }}>●</Box> Lost {performance.lost || 0}</Typography></Stack></Paper>
    </Box>

    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.35fr) minmax(320px, .65fr)" }, gap: 2, mb: 2 }}>
      <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}><Typography variant="h6" fontWeight={800}>Won Revenue Trend</Typography><Typography variant="body2" color="text.secondary" mb={2}>Closed-won value over the last six months</Typography><Box sx={{ height: 210, display: "flex", alignItems: "flex-end", gap: { xs: 1, sm: 2 }, borderBottom: "1px solid #e5e7eb", px: 1 }}>{trend.map((item) => <Box key={item.label} sx={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", minWidth: 0 }}><Typography variant="caption" fontWeight={700} noWrap>{item.value ? money(item.value) : ""}</Typography><Box title={`${item.count} won deals`} sx={{ width: "70%", minHeight: item.value ? 8 : 2, height: `${Math.max((item.value / maxTrend) * 155, item.value ? 8 : 2)}px`, bgcolor: "#16a34a", borderRadius: "7px 7px 0 0", transition: ".3s" }} /><Typography variant="caption" color="text.secondary" mt={1}>{item.label}</Typography></Box>)}</Box></Paper>
      <Paper sx={{ p: 2.5, borderRadius: 3, border: "1px solid #e5e7eb" }}><Stack direction="row" spacing={1} alignItems="center"><Clock3 size={20} color="#f59e0b" /><Typography variant="h6" fontWeight={800}>Closing in 30 Days</Typography></Stack><Stack spacing={1.25} mt={2}>{data?.closingSoon?.length ? data.closingSoon.map((item) => <Paper key={item._id} variant="outlined" onClick={() => navigate(`/opportunity/${item._id}`)} sx={{ p: 1.5, cursor: "pointer", borderRadius: 2, "&:hover": { borderColor: "#86efac" } }}><Stack direction="row" justifyContent="space-between" gap={1}><Box minWidth={0}><Typography fontWeight={700} noWrap>{item.title}</Typography><Typography variant="caption" color="text.secondary">{item.company?.name || "No company"} · {dayjs(item.closeDate).format("MMM D")}</Typography></Box><Typography fontWeight={700} color="success.main">{money(item.amount)}</Typography></Stack></Paper>) : <Typography color="text.secondary" mt={3}>No opportunities closing soon.</Typography>}</Stack></Paper>
    </Box>

    <Paper sx={{ borderRadius: 3, border: "1px solid #e5e7eb", overflow: "hidden" }}><Box sx={{ p: 2.5 }}><Typography variant="h6" fontWeight={800}>Recently Updated Opportunities</Typography><Typography variant="body2" color="text.secondary">Your latest pipeline activity</Typography></Box><TableContainer><Table><TableHead><TableRow><TableCell sx={{ fontWeight: 700 }}>Opportunity</TableCell><TableCell sx={{ fontWeight: 700 }}>Company</TableCell><TableCell sx={{ fontWeight: 700 }}>Stage</TableCell><TableCell sx={{ fontWeight: 700 }}>Probability</TableCell><TableCell sx={{ fontWeight: 700 }}>Value</TableCell><TableCell sx={{ fontWeight: 700 }}>Updated</TableCell></TableRow></TableHead><TableBody>{data?.recentOpportunities?.length ? data.recentOpportunities.map((item) => <TableRow hover key={item._id} sx={{ cursor: "pointer" }} onClick={() => navigate(`/opportunity/${item._id}`)}><TableCell sx={{ fontWeight: 600 }}>{item.title}</TableCell><TableCell>{item.company?.name || "--"}</TableCell><TableCell><Chip size="small" label={item.stage} color={chipColor(item.stage)} /></TableCell><TableCell>{item.probability == null ? "--" : `${item.probability}%`}</TableCell><TableCell>{money(item.amount)}</TableCell><TableCell>{dayjs(item.updatedAt).format("MMM D, YYYY")}</TableCell></TableRow>) : <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>{loading ? "Loading opportunities…" : "No opportunities yet."}</TableCell></TableRow>}</TableBody></Table></TableContainer></Paper>
  </Box>;
}
