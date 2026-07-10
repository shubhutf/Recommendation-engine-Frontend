import { useEffect, useState } from "react";
import { Box, Typography, Stack, LinearProgress, CircularProgress, Divider } from "@mui/material";
import { getAllProducts, getRecommendationLog, getRecommendations } from "../mockApi/client.js";
import { tokens } from "../theme/theme.js";

function bucketByMinute(log) {
  const buckets = {};
  log.forEach((entry) => {
    const d = new Date(entry.timestamp);
    const label = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    buckets[label] = (buckets[label] ?? 0) + 1;
  });
  return Object.entries(buckets)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => (a.label > b.label ? 1 : -1));
}

export default function Analytics() {
  const [rows, setRows] = useState([]);
  const [trend, setTrend] = useState([]);
  const [totalRuns, setTotalRuns] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const products = await getAllProducts();
      let log = await getRecommendationLog();

      // seed some usage history on first visit so the page isn't empty in demo mode
      if (log.length === 0) {
        await Promise.all(products.map((p) => getRecommendations(p.id, 3)));
        log = await getRecommendationLog();
      }

      const counts = {};
      log.forEach((entry) => {
        counts[entry.recommendedProductId] = (counts[entry.recommendedProductId] ?? 0) + 1;
      });

      const ranked = Object.entries(counts)
        .map(([productId, count]) => ({
          product: products.find((p) => p.id === productId),
          count,
        }))
        .filter((r) => r.product)
        .sort((a, b) => b.count - a.count);

      setRows(ranked);
      setTrend(bucketByMinute(log));
      setTotalRuns(log.length);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <CircularProgress sx={{ color: tokens.limeDeep }} />;
  }

  const maxCount = rows[0]?.count ?? 1;
  const maxTrend = Math.max(...trend.map((t) => t.count), 1);

  return (
    <Box>
      <Typography variant="body2" sx={{ color: tokens.slate, mb: 1 }}>
        How often each product has been surfaced as a recommendation, and when.
      </Typography>
      <Typography variant="caption" sx={{ color: tokens.slate }}>
        {totalRuns} recommendation runs logged this session
      </Typography>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Most Recommended Products
      </Typography>
      <Stack spacing={2}>
        {rows.map((row) => (
          <Box key={row.product.id} sx={{ bgcolor: tokens.card, border: `1px solid ${tokens.line}`, borderRadius: 3, p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{row.product.productName}</Typography>
              <Typography className="mono" sx={{ color: tokens.slate }}>
                {row.count} recommendations
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(row.count / maxCount) * 100}
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

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>
        Recommendation Activity Over Time
      </Typography>
      {trend.length <= 1 ? (
        <Typography variant="body2" sx={{ color: tokens.slate }}>
          Not enough activity yet to show a trend — browse the Recommendations page a few more
          times across different minutes and revisit this page.
        </Typography>
      ) : (
        <Box
          sx={{
            bgcolor: tokens.card,
            border: `1px solid ${tokens.line}`,
            borderRadius: 3,
            p: 3,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            height: 160,
          }}
        >
          {trend.map((t) => (
            <Box key={t.label} sx={{ flex: 1, textAlign: "center" }}>
              <Box
                sx={{
                  height: `${(t.count / maxTrend) * 100}px`,
                  bgcolor: tokens.limeDeep,
                  borderRadius: "6px 6px 0 0",
                  mx: "auto",
                  width: "60%",
                  transition: "height 300ms ease",
                }}
              />
              <Typography variant="caption" className="mono" sx={{ color: tokens.slate, mt: 0.5, display: "block" }}>
                {t.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}