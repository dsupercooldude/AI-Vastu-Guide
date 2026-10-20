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

export interface PadaEvaluation {
  code: string; // e.g., "N3", "E4", "S5"
  name: string; // e.g., "Mukhya", "Indra", "Yama"
  direction: 'North' | 'East' | 'South' | 'West';
  zone: string;
  status: 'Auspicious' | 'Neutral' | 'Inauspicious';
  significance: string;
  remedy?: string;
  isMainEntrance?: boolean;
}

export interface VastuRemedy {
  defect: string;
  zone: string;
  remedy: string;
  cost: 'Low' | 'Medium' | 'High';
  effort: 'Low' | 'Medium' | 'High';
  affectedArea?: string; // e.g., "Finance & Cash Flow", "Health & Vitality", "Relationships"
  severity?: 'Critical' | 'Major' | 'Moderate' | 'Minor';
  category?: 'Elemental Strip' | 'Space Programming' | 'Yantra & Crystal' | 'Relocation' | 'Color & Light';
  pada?: string;
  treatmentMetal?: string;
}

export interface GridCalibration {
  rotation: number;
  centerX: number;
  centerY: number;
  radiusScale: number;
}

export interface FloorPlanMappingResult {
  rotation: number; // 0-360 degrees
  centerX: number; // percentage 0-100
  centerY: number; // percentage 0-100
  radiusScale: number; // 0.6 - 2.0
  confidence: number; // percentage 0-100
  detectionMethod: string;
  mainEntrancePada?: string;
  entranceDirection?: string;
  rooms?: { name: string; zone: string; pada?: string; compliant: boolean; note?: string }[];
  defects?: VastuRemedy[];
  summary?: string;
}

export interface AnalysisHistory {
  id: string;
  houseId: string;
  images: string[];
  floorPlans?: string[];
  mappedGridImage?: string; // High-res generated Shakti Chakra mapped floor plan image
  gridCalibration?: GridCalibration;
  description: string;
  report: string;
  score?: number;
  zoneScores?: { 
    zone: string; 
    score: number; 
    status?: 'Balanced' | 'Extended' | 'Depleted'; 
    element?: string; 
  }[];
  houseName?: string;
  timestamp: number;
  verifiedChecklistItems?: number[];
  remedies?: VastuRemedy[];
  padas?: PadaEvaluation[];
  mainEntrancePada?: string;
  aiMappingResult?: FloorPlanMappingResult;
}

