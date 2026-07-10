const WEIGHTS = { category: 0.4, price: 0.2, rating: 0.2, inventory: 0.2 };

function categoryScore(source, candidate) {
  return source.category === candidate.category ? 1 : 0;
}
function priceScore(source, candidate) {
  const diff = Math.abs(source.price - candidate.price);
  const proximity = Math.max(0, 1 - diff / Math.max(source.price, 1));
  const cheaperBonus = candidate.price < source.price ? 0.1 : 0;
  return Math.min(1, proximity + cheaperBonus);
}
function ratingScore(candidate) {
  return candidate.rating / 5;
}
function inventoryScore(stock) {
  return stock > 0 ? 1 : 0;
}

export function getRecommendations(sourceProduct, candidateProducts, stockByProductId, limit = 3) {
  const scored = candidateProducts
    .filter((p) => p.id !== sourceProduct.id)
    .map((candidate) => {
      const stock = stockByProductId[candidate.id] ?? 0;
      const cat = categoryScore(sourceProduct, candidate);
      const price = priceScore(sourceProduct, candidate);
      const rating = ratingScore(candidate);
      const inv = inventoryScore(stock);
      const score = cat * WEIGHTS.category + price * WEIGHTS.price + rating * WEIGHTS.rating + inv * WEIGHTS.inventory;
      return {
        product: candidate,
        stock,
        score: Math.round(score * 100),
        breakdown: {
          category: Math.round(cat * 100),
          price: Math.round(price * 100),
          rating: Math.round(rating * 100),
          inventory: Math.round(inv * 100),
        },
      };
    })
    .filter((r) => r.product.category === sourceProduct.category)
    .sort((a, b) => {
      if (a.stock === 0 && b.stock > 0) return 1;
      if (b.stock === 0 && a.stock > 0) return -1;
      return b.score - a.score;
    });

  return scored.slice(0, limit);
}