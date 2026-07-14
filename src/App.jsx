import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Products from "./pages/Products.jsx";
import InventoryPage from "./pages/Inventory.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Analytics from "./pages/Analytics.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
    </Routes>
  );
}