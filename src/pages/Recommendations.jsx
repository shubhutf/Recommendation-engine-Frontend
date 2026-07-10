import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  MenuItem,
  TextField,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { getAllProducts, getRecommendations } from "../mockApi/client.js";
import { generateExplanation } from "../services/aiExplain.js";
import ScoreRing from "../components/ScoreRing.jsx";
import { tokens } from "../theme/theme.js";

export default function Recommendations() {
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [results, setResults] = useState([]);
  const [explanations, setExplanations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const list = await getAllProducts();
      setProducts(list);
      if (list.length) setSelectedId(list[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      setLoading(true);
      setExplanations({});
      const recs = await getRecommendations(selectedId, 3);
      setResults(recs);
      setLoading(false);

      const source = products.find((p) => p.id === selectedId);
      recs.forEach(async (rec) => {
        const text = await generateExplanation(source, rec);
        setExplanations((prev) => ({ ...prev, [rec.product.id]: text }));
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, products.length]);

  const selected = products.find((p) => p.id === selectedId);

  return (
    <Box>
      <Typography variant="body2" sx={{ color: tokens.slate, mb: 3 }}>
        Pick a product to see the engine's ranked substitutes, their match score, and the
        AI-generated reason for each recommendation.
      </Typography>

      <TextField
        select
        label="Selected product"
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        sx={{ width: 320, mb: 4, bgcolor: tokens.card }}
      >
        {products.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.productName} — ₹{p.price}
          </MenuItem>
        ))}
      </TextField>

      {selected && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 4,
            p: 2,
            bgcolor: tokens.ink,
            color: tokens.paper,
            borderRadius: 3,
          }}
        >
          <Box
            component="img"
            src={selected.imageUrl}
            alt=""
            sx={{ width: 56, height: 56, objectFit: "contain", bgcolor: "#fff", borderRadius: 2, p: 0.5 }}
            onError={(e) => (e.currentTarget.style.visibility = "hidden")}
          />
          <Box>
            <Typography sx={{ fontWeight: 600 }}>{selected.productName}</Typography>
            <Typography variant="caption" sx={{ color: tokens.slateLight }}>
              {selected.category} · ₹{selected.price} · {selected.rating}★ ·{" "}
              {selected.availableQuantity > 0 ? "In stock" : "Out of stock"}
            </Typography>
          </Box>
          <ArrowRightAltIcon sx={{ ml: "auto", color: tokens.lime, fontSize: 32 }} />
          <Typography variant="caption" sx={{ color: tokens.lime, fontWeight: 600 }}>
            {results.length} substitutes found
          </Typography>
        </Box>
      )}

      {loading ? (
        <CircularProgress sx={{ color: tokens.limeDeep }} />
      ) : (
        <Grid container spacing={2.5}>
          {results.map((rec) => (
            <Grid item xs={12} md={6} lg={4} key={rec.product.id}>
              <Card sx={{ border: `1px solid ${tokens.line}`, borderRadius: 3, boxShadow: "none" }}>
                <Stack direction="row" spacing={2} sx={{ p: 2.5, pb: 1.5 }}>
                  <CardMedia
                    component="img"
                    image={rec.product.imageUrl}
                    alt={rec.product.productName}
                    sx={{ width: 64, height: 64, objectFit: "contain", bgcolor: tokens.paper, borderRadius: 2 }}
                    onError={(e) => {
                      e.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {rec.product.productName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.slate }}>
                      {rec.product.brand}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                      <Chip label={`₹${rec.product.price}`} size="small" className="mono" />
                      <Chip label={`${rec.product.rating}★`} size="small" />
                    </Stack>
                  </Box>
                  <ScoreRing score={rec.score} size={56} />
                </Stack>

                <Divider />

                <CardContent>
                  <Chip
                    label={rec.stock > 0 ? "In stock" : "Out of stock"}
                    size="small"
                    sx={{ mb: 1.5, bgcolor: rec.stock > 0 ? "#DFF6C0" : "#FFDCD1", color: tokens.ink }}
                  />
                  <Typography variant="body2" sx={{ color: tokens.slate, minHeight: 60 }}>
                    {explanations[rec.product.id] ?? (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={12} sx={{ color: tokens.limeDeep }} />
                        <span>Generating explanation…</span>
                      </Stack>
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {!loading && results.length === 0 && (
            <Typography sx={{ color: tokens.slate, px: 1 }}>
              No substitutes found in the same category yet — add more products on the Products
              page.
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}