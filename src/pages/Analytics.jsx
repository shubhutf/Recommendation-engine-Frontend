import { useEffect, useState } from "react";
import { Alert, Box, Typography, Stack, LinearProgress, CircularProgress, Divider, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import { getAnalyticsSummary } from "../mockApi/client.js";
import StatCard from "../components/StatCard.jsx";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ManageSearchOutlinedIcon from "@mui/icons-material/ManageSearchOutlined";
import { tokens } from "../theme/theme.js";

function RankedList({ rows, countKey, countLabel, emptyText }) {
  const maxCount = Math.max(...rows.map((r) => r[countKey]), 1);

  if (rows.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: tokens.slate }}>
        {emptyText}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {rows.map((row) => (
        <Box
          key={row.productId}
          sx={{ bgcolor: tokens.card, border: `1px solid ${tokens.line}`, borderRadius: 3, p: 2 }}
        >
          <Stack direction="row" sx={{ mb: 1, justifyContent: "space-between" }}>
            <Box>
              <Typography sx={{ fontWeight: 600 }}>
                {row.productName ?? "Unknown product"}
              </Typography>
              {row.category && (
                <Typography variant="caption" sx={{ color: tokens.slate }}>
                  {row.category} {row.brand ? `· ${row.brand}` : ""}
                </Typography>
              )}
            </Box>
            <Typography className="mono" sx={{ color: tokens.slate }}>
              {row[countKey]} {countLabel}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(row[countKey] / maxCount) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: tokens.paper,
              "& .MuiLinearProgress-bar": { bgcolor: tokens.limeDeep, borderRadius: 4 },
            }}
          />
        </Box>
      ))}
    </Stack>
  );
}

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try { setSummary(await getAnalyticsSummary()); }
      catch (err) { setError(err.response?.data?.message || "Unable to load analytics"); }
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return <CircularProgress sx={{ color: tokens.limeDeep }} />;
  }
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="body2" sx={{ color: tokens.slate, mb: 3 }}>
        Real interaction events only. Simulated training data and legacy seed rows are excluded.
      </Typography>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 4 }}>
        <StatCard
          label="Recommendation Pairs"
          value={summary.totalRecommendationPairs}
          icon={Inventory2OutlinedIcon}
        />
        <StatCard
          label="Products Recommended"
          value={summary.totalRecommendedProducts}
          icon={TrendingUpOutlinedIcon}
          accent="#DFF6C0"
        />
        <StatCard
          label="Products Searched"
          value={summary.totalSourceProducts}
          icon={ManageSearchOutlinedIcon}
        />
      </Stack>

      <Typography variant="h6">Click-through rate by engine and position</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Unique clicks per served impression. These observational rates do not establish which engine causes more clicks.</Typography>
      <Box sx={{ overflowX: "auto", mb: 4 }}><Table size="small" aria-label="Interaction metrics">
        <TableHead><TableRow>{["Engine", "Position", "Impressions", "Clicks", "CTR"].map(label => <TableCell key={label}>{label}</TableCell>)}</TableRow></TableHead>
        <TableBody>{(summary.interactions?.byPositionAndEngine || []).map(row => <TableRow key={`${row.engine}-${row.position}`}>
          <TableCell>{row.engine}</TableCell><TableCell>{row.position}</TableCell><TableCell>{row.impressions}</TableCell><TableCell>{row.clicks}</TableCell><TableCell>{row.ctr == null ? "—" : `${(row.ctr * 100).toFixed(2)}%`}</TableCell>
        </TableRow>)}</TableBody>
      </Table></Box>
      {!summary.interactions?.byPositionAndEngine?.length && <Typography sx={{ mb: 3 }}>No real interaction data yet.</Typography>}
      {summary.logging?.dropped > 0 && <Alert severity="warning">{summary.logging.dropped} logging batches were dropped in this process. Counts may under-report served impressions.</Alert>}

      <Typography variant="h6" sx={{ mb: 2 }}>
        Most Recommended Products
      </Typography>
      <Typography variant="caption" sx={{ color: tokens.slate, display: "block", mb: 2 }}>
        Products that show up most often as a suggested substitute.
      </Typography>
      <RankedList
        rows={summary.topRecommendedProducts.filter((r) => r.productName)}
        countKey="totalRecommendations"
        countLabel="times recommended"
        emptyText="No recommendation data yet."
      />

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Recommendation Trends — Most Searched-For Substitutes
      </Typography>
      <Typography variant="caption" sx={{ color: tokens.slate, display: "block", mb: 2 }}>
        Products people most often look up substitutes for — shows what's trending by frequency,
        not by time.
      </Typography>
      <RankedList
        rows={summary.topSourceProducts.filter((r) => r.productName)}
        countKey="totalTimesRecommended"
        countLabel="searches"
        emptyText="No search history yet."
      />
    </Box>
  );
}
