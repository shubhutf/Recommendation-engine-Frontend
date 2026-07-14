import { Box, Typography, Stack } from "@mui/material";
import { tokens } from "../theme/theme.js";

export default function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <Box sx={{ bgcolor: tokens.card, border: `1px solid ${tokens.line}`, borderRadius: 3, p: 2.5, flex: 1, minWidth: 180 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="caption" sx={{ color: tokens.slate, fontWeight: 600 }}>{label}</Typography>
          <Typography variant="h4" sx={{ mt: 0.5 }}>{value}</Typography>
        </Box>
        {Icon && (
          <Box sx={{ bgcolor: accent ?? tokens.paper, borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon sx={{ fontSize: 20, color: tokens.ink }} />
          </Box>
        )}
      </Stack>
    </Box>
  );
}