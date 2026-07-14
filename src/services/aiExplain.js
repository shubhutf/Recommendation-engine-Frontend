// AI Explanation Module
// ----------------------
// Per the doc: "AI should not make recommendation decisions. Instead, AI should explain
// recommendations." The scoring/ranking already happened in recommendationEngine.js — this
// module ONLY turns a (sourceProduct, recommendation) pair into a human-readable sentence.
//
// generateExplanation() is a rule-based template for now, so the frontend works without any
// API key. When you're ready to wire in OpenAI/Gemini, replace the body of this function —
// keep the same signature and return shape (a Promise<string>) so no page needs to change.

export async function generateExplanation(sourceProduct, recommendation) {
  await new Promise((res) => setTimeout(res, 350)); // simulate network latency

  const { product, stock, breakdown } = recommendation;
  const reasons = [];

  if (breakdown.category === 100) {
    reasons.push(`belongs to the same ${product.category.toLowerCase()} category`);
  }
  if (stock > 0) {
    reasons.push("is currently in stock");
  } else {
    reasons.push("is currently out of stock, so it's ranked lower");
  }
  if (product.price < sourceProduct.price) {
    reasons.push(`is cheaper at ₹${product.price} vs ₹${sourceProduct.price}`);
  } else if (product.price > sourceProduct.price) {
    reasons.push(`is priced a bit higher at ₹${product.price}`);
  } else {
    reasons.push(`is priced the same at ₹${product.price}`);
  }
  if (product.rating > sourceProduct.rating) {
    reasons.push(`has a higher customer rating (${product.rating}★)`);
  } else if (product.rating < sourceProduct.rating) {
    reasons.push(`has a slightly lower rating (${product.rating}★)`);
  } else {
    reasons.push(`matches the rating (${product.rating}★)`);
  }

  const joined =
    reasons.length > 1
      ? reasons.slice(0, -1).join(", ") + ", and " + reasons[reasons.length - 1]
      : reasons[0];

  return `${product.productName} is recommended because it ${joined}.`;
}

/* ---------------------------------------------------------------------------------------
Swapping in a real LLM later (example — don't enable without an API key wired server-side):

export async function generateExplanation(sourceProduct, recommendation) {
  const response = await fetch("/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      selected: sourceProduct,
      recommended: recommendation.product,
      scoreBreakdown: recommendation.breakdown,
    }),
  });
  const data = await response.json();
  return data.explanation;
}
--------------------------------------------------------------------------------------- */