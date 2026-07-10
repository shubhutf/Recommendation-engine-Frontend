import { useEffect, useState } from "react";
import { Box, Typography, Stack, Chip, CircularProgress } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import StatCard from "../components/StatCard.jsx";
import { getAllProducts, getRecommendations } from "../mockApi/client.js";
import { tokens } from "../theme/theme.js";

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [topRecs, setTopRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const list = await getAllProducts();
      setProducts(list);

      const inStock = list.filter((p) => p.availableQuantity > 0).slice(0, 3);
      const results = await Promise.all(inStock.map((p) => getRecommendations(p.id, 1)));
      setTopRecs(results.flat());
      setLoading(false);
    })();
  }, []);

  const total = products.length;
  const available = products.filter((p) => p.availableQuantity > 0).length;
  const outOfStock = total - available;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress sx={{ color: tokens.limeDeep }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ color: tokens.slate, mb: 3 }}>
        Live snapshot of the catalog, stock, and what the recommendation engine is surfacing right now.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <StatCard label="Total Products" value={total} icon={Inventory2OutlinedIcon} />
        <StatCard label="Available" value={available} icon={CheckCircleOutlineIcon} accent="#DFF6C0" />
        <StatCard label="Out of Stock" value={outOfStock} icon={ErrorOutlineIcon} accent="#FFDCD1" />
      </Stack>

      <Typography variant="h6" sx={{ mb: 2 }}>Top Recommended Right Now</Typography>
      <Stack spacing={1.5}>
        {topRecs.map((rec, i) => (
          <Box key={i} sx={{ bgcolor: tokens.card, border: `1px solid ${tokens.line}`, borderRadius: 3, px: 2.5, py: 1.75, display: "flex", alignItems: "center", gap: 2 }}>
            <AutoAwesomeOutlinedIcon sx={{ color: tokens.limeDeep }} />
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{rec.product.productName}</Typography>
              <Typography variant="caption" sx={{ color: tokens.slate }}>
                {rec.product.category} · ₹{rec.product.price} · {rec.product.rating}★
              </Typography>
            </Box>
            <Chip label={`match ${rec.score}`} size="small" sx={{ bgcolor: tokens.lime, color: tokens.ink, fontFamily: "JetBrains Mono" }} />
          </Box>
        ))}
      </Stack>
    </Box>
  );
}