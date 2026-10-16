import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { useAuth } from "./AuthContext.js";
export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <CircularProgress aria-label="Restoring session" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/products" replace />;
  return <Outlet />;
}
