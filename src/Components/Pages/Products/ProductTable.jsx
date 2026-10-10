import { useCallback, useEffect, useState } from "react";
import { Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Add, Delete, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import CreateProductModal from "./CreateProductModal";
import { createProduct, deleteProduct, listProducts } from "./productApi";

const PAGE_SIZES = [25, 50, 100];
const formatMoney = (value, currency = "INR") => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value || 0));

export default function ProductTable({ token }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try { const data = await listProducts(token, { page, limit, search, orderBy: "createdAt", order: "desc" }); setProducts(data.products || []); setTotal(data.total || 0); }
    catch (err) { setError(err?.response?.data?.message || "Unable to load products."); }
    finally { setLoading(false); }
  }, [token, page, limit, search]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSelected([]); }, [page, limit]);

  const save = async (data) => { await createProduct(data, token); toast.success("Product created"); setPage(1); await load(); };
  const remove = async () => { setDeleting(true); try { await Promise.all(selected.map((id) => deleteProduct(id, token))); toast.success(`${selected.length} product${selected.length === 1 ? "" : "s"} deleted`); setSelected([]); setDeleteOpen(false); setConfirmText(""); await load(); } catch (err) { toast.error(err?.response?.data?.message || "Unable to delete products."); } finally { setDeleting(false); } };
  const pages = Math.max(1, Math.ceil(total / limit));
  const allSelected = products.length > 0 && products.every((item) => selected.includes(item._id));

  return <Box>
    <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} mb={2} flexWrap="wrap"><Typography variant="h6" fontWeight="bold" color="success.main">PRODUCTS</Typography><Box display="flex" gap={1}>{selected.length > 0 && <Button color="error" variant="outlined" startIcon={<Delete />} onClick={() => setDeleteOpen(true)}>Delete ({selected.length})</Button>}<Button color="success" variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>Create Product</Button></Box></Box>
    <Box component="form" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }} display="flex" gap={1} mb={2} maxWidth={480}><TextField fullWidth size="small" label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} /><Button type="submit" variant="outlined" color="success" startIcon={<Search />}>Search</Button></Box>
    {error && <Typography color="error" mb={2}>{error}</Typography>}
    <TableContainer component={Paper} sx={{ maxHeight: "calc(100vh - 300px)", borderRadius: 3, border: "1px solid #e0e0e0" }}><Table stickyHeader><TableHead><TableRow><TableCell padding="checkbox"><Checkbox checked={allSelected} onChange={(event) => setSelected(event.target.checked ? products.map((item) => item._id) : [])} /></TableCell><TableCell sx={{ fontWeight: 600 }}>Product</TableCell><TableCell sx={{ fontWeight: 600 }}>SKU</TableCell><TableCell sx={{ fontWeight: 600 }}>Category</TableCell><TableCell sx={{ fontWeight: 600 }}>Price</TableCell><TableCell sx={{ fontWeight: 600 }}>Stock</TableCell><TableCell sx={{ fontWeight: 600 }}>Status</TableCell></TableRow></TableHead><TableBody>
      {loading ? <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={28} /></TableCell></TableRow> : products.length ? products.map((product) => <TableRow hover key={product._id} sx={{ cursor: "pointer" }} onClick={() => navigate(`/product/${product._id}`)}><TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}><Checkbox checked={selected.includes(product._id)} onChange={() => setSelected((current) => current.includes(product._id) ? current.filter((id) => id !== product._id) : [...current, product._id])} /></TableCell><TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell><TableCell>{product.sku}</TableCell><TableCell>{product.category || "--"}</TableCell><TableCell>{formatMoney(product.price, product.currency)}</TableCell><TableCell>{product.stockQuantity ?? 0}</TableCell><TableCell><Chip size="small" label={product.status} color={product.status === "Active" ? "success" : product.status === "Inactive" ? "default" : "warning"} /></TableCell></TableRow>) : <TableRow><TableCell colSpan={7} align="center">No products found.</TableCell></TableRow>}
    </TableBody></Table></TableContainer>
    <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} gap={2} flexWrap="wrap"><Typography variant="body2">Showing {products.length} of {total} products</Typography><Box display="flex" alignItems="center" gap={1}><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Prev</Button><Typography variant="body2">Page {page} of {pages}</Typography><Button disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>Next</Button></Box><FormControl size="small" sx={{ minWidth: 100 }}><InputLabel>Page size</InputLabel><Select label="Page size" value={limit} onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}>{PAGE_SIZES.map((size) => <MenuItem key={size} value={size}>{size}</MenuItem>)}</Select></FormControl></Box>
    <CreateProductModal open={createOpen} token={token} onClose={() => setCreateOpen(false)} onSave={save} />
    <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}><DialogTitle>Delete Products</DialogTitle><DialogContent><Typography>Type DELETE to permanently delete {selected.length} selected product{selected.length === 1 ? "" : "s"}. Opportunity associations will be removed.</Typography><TextField autoFocus fullWidth margin="dense" value={confirmText} onChange={(event) => setConfirmText(event.target.value)} /></DialogContent><DialogActions><Button onClick={() => setDeleteOpen(false)}>Cancel</Button><Button color="error" disabled={confirmText !== "DELETE" || deleting} onClick={remove}>{deleting ? "Deleting…" : "Delete"}</Button></DialogActions></Dialog>
  </Box>;
}
