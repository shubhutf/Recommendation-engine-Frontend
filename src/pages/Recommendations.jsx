import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Box, Typography, Grid, Card, CardContent, CardMedia, Chip, Autocomplete, TextField, Stack, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { getAllProducts, getRecommendations, recordEvent } from "../mockApi/client.js";
import { useAuth } from "../auth/AuthContext.js";
import ScoreRing from "../components/ScoreRing.jsx";
import { tokens } from "../theme/theme.js";

function engineLabel(rec) {
  if (rec.engine === "ml") return "ML v1";
  return `Rule-based (${["cold_start", "anonymous"].includes(rec.fallbackReason) ? "cold start" : "fallback"})`;
}
export default function Recommendations() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [feedback, setFeedback] = useState({});
  const sequence = useRef(0);
  useEffect(() => {
    let active = true;
    getAllProducts().then(list => { if (active) setProducts(list); })
      .catch(() => { if (active) setError("Unable to load the catalog. Check the API connection."); });
    return () => { active = false; };
  }, []);
  async function choose(product) {
    const current = ++sequence.current;
    setSelected(product); setResults([]); setError(""); setFeedback({}); setLoading(Boolean(product));
    if (!product) return;
    if (user) recordEvent({ eventType: "VIEW", productId: product.id }).catch(() => setError("Product view could not be recorded."));
    try {
      const rows = await getRecommendations(product.id);
      if (current === sequence.current) setResults(rows);
    } catch (err) { if (current === sequence.current) setError(err.response?.data?.message || "Recommendations are unavailable. Please try again."); }
    finally { if (current === sequence.current) setLoading(false); }
  }
  async function track(rec, eventType, value) {
    if (!user) return;
    try {
      await recordEvent({ eventType, productId: rec.product.id, impressionId: rec.impressionId, ...(value ? { feedback: value } : {}) });
      if (value) setFeedback(previous => ({ ...previous, [rec.impressionId]: value }));
    } catch (err) { setError(err.response?.data?.message || "Interaction could not be saved. Please try again."); }
  }
  function openProduct(rec) { setDetail(rec.product); track(rec, "CLICK"); track(rec, "VIEW"); }
  return <Box>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Choose a product for ranked substitutes. Gemini describes product facts after ranking. Your interactions help build a real training dataset.</Typography>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {!user && <Alert severity="info" sx={{ mb: 3 }}>Browsing uses the rule-based cold start. <Link to="/login">Sign in</Link> to save interactions and build a personalized history.</Alert>}
    <Autocomplete options={products} value={selected} getOptionLabel={p => `${p.productName} — ₹${p.price}`} isOptionEqualToValue={(a, b) => a.id === b.id}
      onChange={(_, product) => choose(product)} sx={{ maxWidth: 480, mb: 3 }} renderInput={params => <TextField {...params} label="Find substitutes for a product" />} />
    {selected && <Box sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: tokens.ink, color: tokens.paper }}>
      <Typography variant="h6">{selected.productName}</Typography><Typography variant="body2">{selected.category} · ₹{selected.price} · {selected.rating}★</Typography>
    </Box>}
    {loading ? <CircularProgress aria-label="Loading recommendations" /> : <Grid container spacing={2.5}>
      {results.map(rec => <Grid size={{ xs: 12, md: 6, lg: 4 }} key={rec.impressionId}>
        <Card sx={{ border: `1px solid ${tokens.line}`, borderRadius: 3, boxShadow: "none", height: "100%" }}>
          <CardContent><Stack spacing={2}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}><Chip label={engineLabel(rec)} sx={{ bgcolor: rec.engine === "ml" ? tokens.lime : tokens.paper }} size="small" /><Typography variant="caption">#{rec.position}</Typography></Stack>
            {rec.product.imageUrl && <CardMedia component="img" image={rec.product.imageUrl} alt={rec.product.productName} sx={{ height: 100, objectFit: "contain" }} onError={e => { e.currentTarget.style.display = "none"; }} />}
            <Button onClick={() => openProduct(rec)} sx={{ justifyContent: "flex-start", p: 0, textAlign: "left" }}><Typography variant="h6">{rec.product.productName}</Typography></Button>
            <Typography variant="body2" color="text.secondary">{rec.product.brand} · ₹{rec.product.price} · {rec.product.rating}★</Typography>
            <Chip label={rec.stock ? "In stock" : "Out of stock"} size="small" sx={{ alignSelf: "flex-start", bgcolor: rec.stock ? "#DFF6C0" : "#FFDCD1" }} />
            {rec.engine === "ml" ? <Box><Typography className="mono">Model score: {rec.modelScore.toFixed(4)}</Typography><Typography variant="caption" color="text.secondary">Ranking margin · {rec.modelVersion}</Typography>
              {rec.trainingSource === "simulated" && <Typography variant="caption" display="block">Trained on simulated data</Typography>}</Box>
              : <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}><ScoreRing score={rec.score} size={54} /><Typography variant="caption">Rule score / 100</Typography></Stack>}
            <Typography variant="body2" color="text.secondary">{rec.explanation}</Typography>
            <Button variant="outlined" onClick={() => openProduct(rec)}>View product</Button>
            <Stack direction="row" spacing={1}><Button size="small" disabled={!user} variant={feedback[rec.impressionId] === "helpful" ? "contained" : "text"} onClick={() => track(rec, "FEEDBACK", "helpful")}>Helpful</Button>
              <Button size="small" disabled={!user} variant={feedback[rec.impressionId] === "not-helpful" ? "contained" : "text"} onClick={() => track(rec, "FEEDBACK", "not-helpful")}>Not helpful</Button></Stack>
          </Stack></CardContent>
        </Card>
      </Grid>)}
    </Grid>}
    {!loading && selected && !results.length && !error && <Typography>No substitutes found in this category.</Typography>}
    <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm"><DialogTitle>{detail?.productName}</DialogTitle><DialogContent><Typography>{detail?.description || `${detail?.brand} · ${detail?.category}`}</Typography><Typography sx={{ mt: 2 }}>₹{detail?.price} · {detail?.rating}★</Typography></DialogContent><DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions></Dialog>
  </Box>;
}
