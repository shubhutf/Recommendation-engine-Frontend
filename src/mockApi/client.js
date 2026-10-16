import axiosClient from "../api/axiosClient.js";

function normalize(product) {
  return { ...product, id: product._id };
}

// ---- Categories & Brands ----
// Not separate collections — derived live from real products, so they're never stale
// and never fake. No "create" functions needed: typing a new category/brand on a
// product IS creating it, since it's just a field value, not its own entity.
export async function getCategories() {
  const products = await getAllProducts();
  return [...new Set(products.map((p) => p.category).filter(Boolean))];
}

export async function getBrands() {
  const products = await getAllProducts();
  return [...new Set(products.map((p) => p.brand).filter(Boolean))];
}

// ---- Products ----
export async function getAllProducts(query = {}) {
  // Follow server pagination so categories/brands include the complete catalog.
  const res = await axiosClient.get("/products", { params: { limit: 200, ...query } });
  const products = res.data.data.products.map(normalize);
  for (let page = 2; page <= res.data.data.pagination.totalPages; page++) {
    const next = await axiosClient.get("/products", { params: { limit: 200, ...query, page } });
    products.push(...next.data.data.products.map(normalize));
  }

  // backend doesn't include stock on the product itself — merge it in from inventory
  const inventory = await getAllInventory();
  const stockMap = Object.fromEntries(inventory.map((i) => [i.productId, i.availableQuantity]));

  return products.map((p) => ({ ...p, availableQuantity: stockMap[p.id] ?? 0 }));
}

export async function createProduct(productData) {
  const res = await axiosClient.post("/products", productData);
  return normalize(res.data.data);
}

export async function updateProduct(productId, updateData) {
  const res = await axiosClient.put(`/products/${productId}`, updateData);
  return normalize(res.data.data);
}

export async function deleteProduct(productId) {
  const res = await axiosClient.delete(`/products/${productId}`);
  return res.data.data;
}

// ---- Inventory ----
export async function getAllInventory() {
  const res = await axiosClient.get("/inventory");
  return res.data.data.map((i) => {
    const populatedProduct = typeof i.productId === "object" ? i.productId : null;
    return {
      ...i,
      id: i._id,
      productId: populatedProduct ? populatedProduct._id : i.productId,
      product: populatedProduct ? { ...populatedProduct, id: populatedProduct._id } : null,
    };
  });
}

export async function createInventory({ productId, availableQuantity }) {
  const res = await axiosClient.post("/inventory", { productId, availableQuantity });
  return res.data.data;
}

export async function updateInventory(inventoryId, updateData) {
  const res = await axiosClient.put(`/inventory/${inventoryId}`, updateData);
  return res.data.data;
}

// ---- Recommendations ----
// The API returns selected products, actual engine/version, scores and exposure IDs.
export async function getRecommendations(productId) {
  const res = await axiosClient.get(`/recommendations/${productId}`);

  if (!Array.isArray(res.data.recommendations)) {
    console.warn(`No recommendations returned for product ${productId}:`, res.data);
    return [];
  }

  return res.data.recommendations
    .map((r) => {
      if (!r.product) return null;
      return {
        ...r,
        product: normalize(r.product),
        score: r.engine === "rules" ? Math.round(r.score * 100) : r.score,
        breakdown: r.breakdown,
        stock: r.breakdown.inventoryScore > 0,
        explanation: r.explanation,
      };
    })
    .filter(Boolean);
}

export async function recordEvent(event) { return (await axiosClient.post("/events", event)).data; }
export async function getMLInsights() { return (await axiosClient.get("/ml/insights")).data; }

// ---- Analytics (matches analyticsService.js — real data, no separate wrapper) ----
export async function getAnalyticsSummary() {
  const res = await axiosClient.get("/analytics/summary");
  return res.data; // this route returns the summary object directly, no {success, data} wrapper
}
