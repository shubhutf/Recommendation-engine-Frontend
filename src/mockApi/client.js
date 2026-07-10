import { products as seedProducts, inventory as seedInventory } from "../data/products.js";
import { getRecommendations as scoreRecommendations } from "../services/recommendationEngine.js";

const LATENCY = 300;
let products = [...seedProducts];
let inventory = [...seedInventory];
const recommendationLog = [];

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));
}
function stockMap() {
  return Object.fromEntries(inventory.map((i) => [i.productId, i.availableQuantity]));
}

// ---- Products (matches product.controller.js) ----
export async function getAllProducts(query = {}) {
  let result = products.map((p) => ({ ...p, availableQuantity: stockMap()[p.id] ?? 0 }));
  if (query.category) result = result.filter((p) => p.category === query.category);
  if (query.brand) result = result.filter((p) => p.brand === query.brand);
  return delay(result);
}
export async function createProduct(productData) {
  const newProduct = { id: `p${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), ...productData };
  products = [...products, newProduct];
  inventory = [...inventory, { productId: newProduct.id, availableQuantity: productData.availableQuantity ?? 0, updatedAt: newProduct.createdAt }];
  return delay(newProduct);
}
export async function updateProduct(productId, updateData) {
  products = products.map((p) => (p.id === productId ? { ...p, ...updateData } : p));
  return delay(products.find((p) => p.id === productId));
}
export async function deleteProduct(productId) {
  const deleted = products.find((p) => p.id === productId) ?? null;
  products = products.filter((p) => p.id !== productId);
  inventory = inventory.filter((i) => i.productId !== productId);
  return delay(deleted);
}

// ---- Categories & Brands (part of Product Management per the doc) ----
let categories = ["Dairy", "Detergent"];
let brands = ["Amul", "Nestle", "Mother Dairy", "Aavin", "Heritage", "Tide", "Ariel", "Surf Excel", "Rin"];

export async function getCategories() {
  return delay([...categories]);
}
export async function createCategory(name) {
  if (!categories.includes(name)) categories = [...categories, name];
  return delay([...categories]);
}
export async function getBrands() {
  return delay([...brands]);
}
export async function createBrand(name) {
  if (!brands.includes(name)) brands = [...brands, name];
  return delay([...brands]);
}

// ---- Inventory (matches inventory.controller.js) ----
export async function getAllInventory() {
  return delay(inventory.map((i) => ({ ...i, product: products.find((p) => p.id === i.productId) ?? null })));
}
export async function createInventory({ productId, availableQuantity }) {
  const entry = { productId, availableQuantity, updatedAt: new Date().toISOString().slice(0, 10) };
  inventory = [...inventory, entry];
  return delay(entry);
}
export async function updateInventory(id, updateData) {
  inventory = inventory.map((i) => (i.productId === id ? { ...i, ...updateData, updatedAt: new Date().toISOString().slice(0, 10) } : i));
  return delay(inventory.find((i) => i.productId === id));
}

// ---- Recommendations (matches recommendation.controller.js) ----
export async function getRecommendations(productId, limit = 5) {
  const source = products.find((p) => p.id === productId);
  if (!source) return delay([]);
  const results = scoreRecommendations(source, products, stockMap(), Number(limit));
  results.forEach((r) => {
    recommendationLog.push({ sourceProductId: productId, recommendedProductId: r.product.id, recommendationScore: r.score, timestamp: new Date().toISOString() });
  });
  return delay(results);
}
export async function getRecommendationLog() {
  return delay([...recommendationLog]);
}

