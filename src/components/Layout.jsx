import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Alert, Box, Typography, Stack, Button } from "@mui/material";
import axiosClient from "../api/axiosClient.js";
import { useAuth } from "../auth/AuthContext.js";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import { tokens } from "../theme/theme.js";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: SpaceDashboardOutlinedIcon, end: true },
  { to: "/products", label: "Products", icon: Inventory2OutlinedIcon },
  { to: "/inventory", label: "Inventory", icon: WarehouseOutlinedIcon, role: "admin" },
  { to: "/recommendations", label: "Recommendations", icon: AutoAwesomeOutlinedIcon },
  { to: "/analytics", label: "Analytics", icon: InsightsOutlinedIcon },
  { to: "/ml-insights", label: "ML Insights", icon: InsightsOutlinedIcon },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [demo, setDemo] = useState(false);
  useEffect(() => { axiosClient.get("/health").then(({ data }) => setDemo(data.dataMode === "disposable-demo")).catch(() => {}); }, []);
  const location = useLocation();
  const current = NAV_ITEMS.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh", bgcolor: tokens.paper }}>
      <Box component="nav" sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0, bgcolor: tokens.ink, color: tokens.paper, display: "flex", flexDirection: "column", position: "sticky", zIndex: 10, top: 0, height: { xs: "auto", md: "100vh" } }}>
        <Box sx={{ px: 3, py: { xs: 1.5, md: 3.5 } }}>
          <Stack direction="row" sx={{ alignItems: "baseline" }} spacing={0.5}>
            <Typography variant="h5" sx={{ color: tokens.lime, letterSpacing: -0.5 }}>Restock</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: tokens.slateLight }}>Substitution Engine</Typography>
        </Box>

        <Stack direction={{ xs: "row", md: "column" }} sx={{ px: 1.5, pb: { xs: 1, md: 0 }, gap: 0.5, mt: 1, flexWrap: "wrap" }}>
          {NAV_ITEMS.filter(item => !item.role || user?.role === item.role).map(({ to, label, icon: Icon, end }) => (
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

        <Box sx={{ display: { xs: "none", md: "block" }, mt: "auto", px: 3, py: 3 }}>
          <Typography variant="caption" sx={{ color: tokens.slateLight, display: "block" }}>
            Live backend
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.slateLight }}>
            Rules + XGBoost · Gemini explanations
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ px: { xs: 3, md: 5 }, py: 2.5, borderBottom: `1px solid ${tokens.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">{current?.label ?? ""}</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {user ? <><Typography variant="caption">{user.email} · {user.role}</Typography><Button onClick={logout}>Log out</Button></>
              : <Button component={Link} to="/login">Sign in</Button>}
          </Stack>
        </Box>
        <Box sx={{ px: { xs: 3, md: 5 }, py: 4 }}>
          {demo && <Alert severity="info" sx={{ mb: 3 }}>Local demo · simulated catalog. Accounts and interaction data reset when the API stops.</Alert>}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
