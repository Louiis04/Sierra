import { Product } from "../interfaces/Product.interface";
import { ProductCatalogTree } from "../trees/ProductCatalogTree";
import { UserProfileTree } from "../trees/UserProfileTree";

const PT_STOPWORDS = new Set([
    'a', 'o', 'as', 'os', 'ao', 'aos', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na',
    'nos', 'nas', 'um', 'uma', 'uns', 'umas', 'com', 'por', 'para', 'e', 'ou', 'mas',
    'pelo', 'pela', 'pelos', 'pelas', 'que', 'qual', 'ansioso', 'novo', 'nova'
]);

export function processUserAction(actionString: string): string[] {
  const cleanedString = actionString.toLowerCase().replace(/[.,!?>()]/g, "");
  const words = cleanedString.split(/\s+/);
  return words.filter((word) => word && !PT_STOPWORDS.has(word));
}

export interface ScoredProduct {
  product: Product;
  score: number;
  matchingTokens: string[];
}

export function generateRecommendations(
  userProfile: UserProfileTree,
  catalog: ProductCatalogTree,
  topN_tokens: number = 10
): ScoredProduct[] {
  const userTopTokens = userProfile.getTopTokens(topN_tokens);
  if (userTopTokens.length === 0) return [];

  const userTokenMap = new Map(userTopTokens.map((t) => [t.token, t.weight]));
  const allProducts = catalog.getAllProducts();
  const recommendedProducts: ScoredProduct[] = [];

  for (const product of allProducts) {
    let affinityScore = 0;
    const matchingTokens: string[] = [];

    const productTokens = new Set([
      ...product.name.toLowerCase().split(" "),
      ...product.brand.toLowerCase().split(" "),
      ...product.description.toLowerCase().split(" "),
      ...product.keywords,
      ...product.categoryPath.map((c) => c.toLowerCase()),
    ]);

    for (const [token, weight] of userTokenMap.entries()) {
      if (productTokens.has(token)) {
        affinityScore += weight;
        matchingTokens.push(token);
      }
    }

    if (affinityScore > 0) {
      recommendedProducts.push({
        product,
        score: affinityScore,
        matchingTokens,
      });
    }
  }

  recommendedProducts.sort((a, b) => b.score - a.score);
  return recommendedProducts;
}
