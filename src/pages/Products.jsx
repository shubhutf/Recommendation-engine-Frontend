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
  Stack,
  CircularProgress,
  IconButton,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  createInventory,
} from "../mockApi/client.js";
import { tokens } from "../theme/theme.js";

const EMPTY_FORM = {
  productName: "",
  category: "",
  brand: "",
  price: "",
  rating: "",
  imageUrl: "",
  initialQuantity: "",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
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
    setForm(EMPTY_FORM);
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
      initialQuantity: "",
    });
    setOpen(true);
  }

  async function handleSave() {
    const { initialQuantity, ...productFields } = form;
    const payload = { ...productFields, price: Number(form.price), rating: Number(form.rating) };

    if (editingId) {
      await updateProduct(editingId, payload);
    } else {
      const newProduct = await createProduct(payload);
      await createInventory({
        productId: newProduct.id,
        availableQuantity: Number(initialQuantity) || 0,
      });
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

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: tokens.slate }}>
          Catalog, categories, and brands. Categories/brands are pulled live from your products —
          type a new one on any product to introduce it.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
          Add product
        </Button>
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
            <Autocomplete
              freeSolo
              options={categories}
              value={form.category}
              onInputChange={(_, val) => setForm({ ...form, category: val })}
              renderInput={(params) => <TextField {...params} label="Category" fullWidth />}
            />
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
            {!editingId && (
              <TextField
                label="Initial stock quantity"
                type="number"
                value={form.initialQuantity}
                onChange={(e) => setForm({ ...form, initialQuantity: e.target.value })}
                fullWidth
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.productName || !form.category}>
            {editingId ? "Save changes" : "Save product"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}