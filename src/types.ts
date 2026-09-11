export interface Profile {
  id: string;
  name: string;
  password?: string;
}

export interface House {
  id: string;
  profileId: string;
  name: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  verifiedChecklistItems?: number[];
  sources?: { title: string; uri: string }[];
}

export interface AnalysisHistory {
  id: string;
  houseId: string;
  images: string[];
  floorPlans?: string[];
  description: string;
  report: string;
  score?: number;
  zoneScores?: { zone: string; score: number }[];
  houseName?: string;
  timestamp: number;
  verifiedChecklistItems?: number[];
  remedies?: VastuRemedy[];
}

export interface VastuRemedy {
  defect: string;
  zone: string;
  remedy: string;
  cost: 'Low' | 'Medium' | 'High';
  effort: 'Low' | 'Medium' | 'High';
}
