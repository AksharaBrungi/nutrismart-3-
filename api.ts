import { UserProfile, HistoryItem, NutritionData, DetectionResult, ReverseSearchResult } from "./types";

const API_BASE = "/api";

const getHeaders = () => {
  const token = localStorage.getItem("nutrismart_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  async register(data: any): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async login(data: any): Promise<{ token: string; user: UserProfile }> {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async logout(): Promise<void> {
    localStorage.removeItem("nutrismart_token");
  },

  async me(): Promise<UserProfile | null> {
    const res = await fetch(`${API_BASE}/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    return res.json();
  },

  async updateProfile(data: { name: string; dailyTargets: NutritionData }): Promise<void> {
    const res = await fetch(`${API_BASE}/user/targets`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async updateWater(waterTotal: number): Promise<void> {
    const res = await fetch(`${API_BASE}/user/water`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ waterTotal }),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async getHistory(): Promise<HistoryItem[]> {
    const res = await fetch(`${API_BASE}/history`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async addHistory(item: HistoryItem): Promise<void> {
    const res = await fetch(`${API_BASE}/history`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/history/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async clearHistory(): Promise<void> {
    const res = await fetch(`${API_BASE}/history`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
  },

  async analyzeFoodImage(base64Image: string, targets: NutritionData): Promise<DetectionResult> {
    const res = await fetch(`${API_BASE}/analyze-image`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ base64Image, targets }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getRecommendationsForMacros(macros: NutritionData, targets: NutritionData): Promise<{ alternatives: { name: string, reason: string }[] }> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ macros, targets }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async reverseNutritionSearch(inputMacros: Partial<NutritionData>): Promise<ReverseSearchResult[]> {
    const res = await fetch(`${API_BASE}/reverse-search`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ inputMacros }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
