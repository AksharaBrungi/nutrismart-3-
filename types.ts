
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface FoodItem {
  id: string;
  name: string;
  confidence: number;
  box: BoundingBox;
  nutritionPer100g: NutritionData;
  estimatedWeightGrams: number;
  cookingMethodAdvice?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  image: string;
  items: FoodItem[];
  totalMacros: NutritionData;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  dailyTargets: NutritionData;
  waterTotal: number;
}

export interface DetectionResult {
  items: FoodItem[];
  smartAlternatives: {
    name: string;
    reason: string;
    estimatedMacros: Partial<NutritionData>;
  }[];
}

export interface ReverseSearchResult {
  mealName: string;
  ingredients: string[];
  macros: NutritionData;
  cookingTips: string;
}
