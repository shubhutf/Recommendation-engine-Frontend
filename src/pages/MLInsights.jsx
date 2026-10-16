import { useEffect, useState } from "react";
import { Alert, Box, Chip, CircularProgress, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { getMLInsights } from "../mockApi/client.js";
import { tokens } from "../theme/theme.js";
export default function MLInsights() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getMLInsights().then(value => { if (active) setData(value); }).catch(err => { if (active) setError(err.response?.data?.message || "Unable to load model artifacts"); });
    return () => { active = false; };
  }, []);
  if (error) return <Alert severity="warning">{error}</Alert>;
  if (!data) return <CircularProgress aria-label="Loading ML insights" />;
  const metrics = data.evaluation.metrics;
  const maxImportance = Math.max(...data.feature_importance.map(row => row.importance), 0.01);
  return <Stack spacing={3}>
    <Box><Chip label={data.training_source === "simulated" ? "Simulated data" : "Real interaction data"} sx={{ bgcolor: tokens.lime, mb: 1 }} /><Typography variant="h4">Measured, then served.</Typography><Typography color="text.secondary">{data.version} · Trained {new Date(data.trained_at).toLocaleString()}</Typography></Box>
    <Alert severity="info">{data.evaluation.limitation} This table evaluates the ranker on shown candidate sets. It does not measure the deployed cold-start policy or prove online lift.</Alert>
    <Paper variant="outlined" sx={{ p: 3, overflowX: "auto" }}><Typography variant="h6">Held-out ranking quality</Typography><Table aria-label="Baseline versus ML metrics"><TableHead><TableRow>{["Engine", "Precision@3", "Recall@3", "NDCG@3"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead><TableBody>
      {[ ["Rule-based", metrics.rules], ["XGBoost", metrics.ml] ].map(([label, values]) => <TableRow key={label}><TableCell>{label}</TableCell>{["precision_at_3", "recall_at_3", "ndcg_at_3"].map(key => <TableCell className="mono" key={key}>{values[key].toFixed(4)}</TableCell>)}</TableRow>)}
    </TableBody></Table><Typography variant="caption">{metrics.requests} test requests · {metrics.requests_with_positive} with a positive outcome · all-negative requests score zero</Typography><Typography variant="body2" sx={{ mt: 1 }}>Precision: positive items in the top three. Recall: fraction of shown positives recovered. NDCG: rank quality with more credit for cart and purchase outcomes.</Typography></Paper>
    <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
      <Paper variant="outlined" sx={{ p: 3, flex: 1 }}><Typography variant="h6" sx={{ mb: 2 }}>Feature importance</Typography><Typography variant="caption">Normalized XGBoost split gain; predictive association, not causal explanation.</Typography>
        <Stack spacing={1.5} sx={{ mt: 2 }}>{data.feature_importance.map(row => <Box key={row.feature}><Stack direction="row" sx={{ justifyContent: "space-between" }}><Typography variant="body2">{row.feature.replaceAll("_", " ")}</Typography><Typography className="mono" variant="caption">{(row.importance * 100).toFixed(1)}%</Typography></Stack><LinearProgress aria-label={row.feature} variant="determinate" value={row.importance / maxImportance * 100} sx={{ mt: 0.5, height: 6, borderRadius: 3 }} /></Box>)}</Stack>
      </Paper>
      <Stack spacing={3} sx={{ flex: 1 }}><Paper variant="outlined" sx={{ p: 3 }}><Typography variant="h6">Dataset summary</Typography><Typography sx={{ mt: 1 }}>{data.dataset.users} users · {data.dataset.products} products · {data.dataset.events} events</Typography>
        <Typography variant="body2" color="text.secondary">Source: {data.dataset.source}. {data.dataset.seed != null && `RNG seed ${data.dataset.seed}.`} Chronological split with {data.split.embargo_hours}h label-maturity gaps.</Typography>
        <Stack spacing={1} sx={{ mt: 2 }}>{["train", "validation", "test"].map(key => <Typography variant="body2" key={key}>{key}: {data.split[key].requests} requests / {data.split[key].rows} examples</Typography>)}</Stack></Paper>
        <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="h6">Cold start & fallback</Typography><Typography sx={{ mt: 1 }} variant="body2">{data.coldStart.explanation}</Typography><Typography variant="body2" sx={{ mt: 1 }}>Personalization starts after positive interactions with {data.coldStart.minimumDistinctProducts} distinct products. Gemini only explains already selected results.</Typography></Paper>
        <Paper variant="outlined" sx={{ p: 3 }}><Typography variant="h6">What the score means</Typography><Typography variant="body2" sx={{ mt: 1 }}>{data.score_semantics}. Cosine similarity is one feature; XGBoost learns the ranking from observed outcomes.</Typography></Paper>
      </Stack>
    </Stack>
  </Stack>;
}
