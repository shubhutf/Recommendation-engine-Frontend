import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Typography, Stack } from "@mui/material";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { tokens } from "../theme/theme.js";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: SpaceDashboardOutlinedIcon, end: true },
  { to: "/products", label: "Products", icon: Inventory2OutlinedIcon },
  { to: "/inventory", label: "Inventory", icon: WarehouseOutlinedIcon },
  { to: "/recommendations", label: "Recommendations", icon: AutoAwesomeOutlinedIcon },
  { to: "/analytics", label: "Analytics", icon: InsightsOutlinedIcon },
];

export default function Layout() {
  const location = useLocation();
  const current = NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: tokens.paper }}>
      <Box component="nav" sx={{ width: 240, flexShrink: 0, bgcolor: tokens.ink, color: tokens.paper, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <Box sx={{ px: 3, py: 3.5 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.5}>
            <Typography variant="h5" sx={{ color: tokens.lime, letterSpacing: -0.5 }}>Restock</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: tokens.slateLight }}>Substitution Engine</Typography>
        </Box>

        <Stack sx={{ px: 1.5, gap: 0.5, mt: 1 }}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <Box key={to} component={NavLink} to={to} end={end} sx={{
              display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.2, borderRadius: 2,
              textDecoration: "none", color: tokens.paper, fontWeight: 500, fontSize: 14,
              transition: "background-color 120ms ease",
              "&.active": { bgcolor: tokens.inkSoft, color: tokens.lime },
              "&:hover": { bgcolor: tokens.inkSoft },
            }}>
              <Icon sx={{ fontSize: 20 }} />
              {label}
            </Box>
          ))}
        </Stack>

        <Box sx={{ mt: "auto", px: 3, py: 3 }}>
          <Typography variant="caption" sx={{ color: tokens.slateLight, display: "block" }}>
            Live backend
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.slateLight }}>
            MongoDB + Gemini AI
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ px: { xs: 3, md: 5 }, py: 2.5, borderBottom: `1px solid ${tokens.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">{current?.label ?? ""}</Typography>
        </Box>
        <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}