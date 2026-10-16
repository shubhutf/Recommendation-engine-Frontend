import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { lazy, Suspense } from "react";
import { CircularProgress } from "@mui/material";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const InventoryPage = lazy(() => import("./pages/Inventory.jsx"));
const Recommendations = lazy(() => import("./pages/Recommendations.jsx"));
const Analytics = lazy(() => import("./pages/Analytics.jsx"));
const Auth = lazy(() => import("./pages/Auth.jsx"));
const MLInsights = lazy(() => import("./pages/MLInsights.jsx"));

export default function App() {
  return (
    <Suspense fallback={<CircularProgress aria-label="Loading page" />}><Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/inventory" element={<InventoryPage />} />
        </Route>
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ml-insights" element={<MLInsights />} />
      </Route>
    </Routes></Suspense>
  );
}
