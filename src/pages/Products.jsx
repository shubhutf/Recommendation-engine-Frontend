import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  IconButton,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getBrands,
  createBrand,
} from "../mockApi/client.js";
import { tokens } from "../theme/theme.js";

const EMPTY_FORM = { productName: "", category: "Dairy", brand: "", price: "", rating: "", imageUrl: "" };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function load() {
    setLoading(true);
    const [p, c, b] = await Promise.all([getAllProducts(), getCategories(), getBrands()]);
    setProducts(p);
    setCategories(c);
    setBrands(b);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openAddDialog() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, category: categories[0] ?? "" });
    setOpen(true);
  }

  function openEditDialog(product) {
    setEditingId(product.id);
    setForm({
      productName: product.productName,
      category: product.category,
      brand: product.brand,
      price: String(product.price),
      rating: String(product.rating),
      imageUrl: product.imageUrl,
    });
    setOpen(true);
  }

  async function handleSave() {
    const payload = { ...form, price: Number(form.price), rating: Number(form.rating) };
    if (form.brand && !brands.includes(form.brand)) {
      await createBrand(form.brand);
    }
    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      await createProduct(payload);
    }
    setOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
    load();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this product?")) return;
    await deleteProduct(id);
    load();
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    await createCategory(newCategory.trim());
    setNewCategory("");
    load();
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: tokens.slate }}>
          Catalog, categories, and brands. Changes here feed straight into the recommendation
          engine.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<SellOutlinedIcon />} onClick={() => setManageOpen(true)}>
            Manage categories
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
            Add product
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <CircularProgress sx={{ color: tokens.limeDeep }} />
      ) : (
        <Grid container spacing={2.5}>
          {products.map((p) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={p.id}>
              <Card sx={{ border: `1px solid ${tokens.line}`, borderRadius: 3, boxShadow: "none", height: "100%", position: "relative" }}>
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ position: "absolute", top: 8, right: 8, zIndex: 1, bgcolor: "rgba(255,255,255,0.9)", borderRadius: 2 }}
                >
                  <IconButton size="small" onClick={() => openEditDialog(p)}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(p.id)}>
                    <DeleteOutlinedIcon fontSize="small" sx={{ color: tokens.coral }} />
                  </IconButton>
                </Stack>

                <CardMedia
                  component="img"
                  image={p.imageUrl}
                  alt={p.productName}
                  sx={{ height: 140, objectFit: "contain", bgcolor: tokens.paper, p: 2 }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <CardContent>
                  <Chip label={p.category} size="small" sx={{ bgcolor: tokens.paper, mb: 1, fontSize: 11 }} />
                  <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>{p.productName}</Typography>
                  <Typography variant="caption" sx={{ color: tokens.slate }}>{p.brand}</Typography>
                  <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
                    <Typography className="mono" sx={{ fontWeight: 700 }}>₹{p.price}</Typography>
                    <Typography variant="body2">{p.rating}★</Typography>
                  </Stack>
                  <Chip
                    label={p.availableQuantity > 0 ? "In stock" : "Out of stock"}
                    size="small"
                    sx={{ mt: 1.5, bgcolor: p.availableQuantity > 0 ? "#DFF6C0" : "#FFDCD1", color: tokens.ink }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add / edit product dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Edit product" : "Add product"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Product name"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Category"
              select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <Autocomplete
              freeSolo
              options={brands}
              value={form.brand}
              onInputChange={(_, val) => setForm({ ...form, brand: val })}
              renderInput={(params) => <TextField {...params} label="Brand" fullWidth />}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Price (₹)"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                fullWidth
              />
              <TextField
                label="Rating"
                type="number"
                inputProps={{ step: 0.1, min: 0, max: 5 }}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                fullWidth
              />
            </Stack>
            <TextField
              label="Image URL"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.productName}>
            {editingId ? "Save changes" : "Save product"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage categories dialog */}
      <Dialog open={manageOpen} onClose={() => setManageOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Manage categories</DialogTitle>
        <DialogContent>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3, mt: 1 }}>
            {categories.map((c) => (
              <Chip key={c} label={c} sx={{ bgcolor: tokens.paper }} />
            ))}
          </Stack>
          <Stack direction="row" spacing={1}>
            <TextField
              label="New category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              fullWidth
              size="small"
            />
            <Button variant="contained" onClick={handleAddCategory}>
              Add
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setManageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}