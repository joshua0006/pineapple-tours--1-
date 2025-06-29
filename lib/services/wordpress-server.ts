import { cache } from "react";
import WordPressAPIService, {
  CategorizedWordPressData,
} from "@/lib/services/wordpress-api";

/**
 * getWordPressData – SSR/ISR helper
 * Fetches the complete categorized WordPress payload **once** per hour and
 * shares it across all rendering workers via React/Next.js request cache.
 */
export const getWordPressData = cache(
  async (): Promise<CategorizedWordPressData> => {
    // Direct call – avoids the extra hop through our API route.
    const data = await WordPressAPIService.fetchAllCategorizedData();
    return data;
  }
);
