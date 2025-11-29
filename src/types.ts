
export interface ItemSpecific {
  key: string;
  value: string;
}

export interface Pricing {
  low: number;
  high: number;
  currency: string;
}

export interface SearchSource {
  title: string;
  uri: string;
}

export interface UserSettings {
  defaultCondition: string;
  defaultShippingCost: number;
  defaultFeeRate: number; // Percentage, e.g. 12.8
  includePostageInProfit: boolean;
}

export interface ArbitrageAnalysis {
  isScreenshot: boolean;
  detectedBuyPrice?: number; // Price found in the image
  platform?: string; // e.g., "Facebook Marketplace"
  ebayFees: number; // Estimated 12.8% + 30p
  shippingCost: number; 
  netProfit: {
    low: number;
    high: number;
  };
  roi: number; // Return on Investment percentage
}

export interface PlatformSuitability {
  ebay: boolean;
  facebook: boolean;
  etsy: boolean;
  vinted: boolean;
  reasons?: {
    vinted?: string;
    etsy?: string;
  };
}

export interface ListingResult {
  id: string;        // Unique ID for the item
  timestamp: number; // When analyzed
  thumbnail?: string; // URL from Supabase Storage
  
  // Listing Data
  title: string;
  facebookTitle: string;
  etsyTitle: string;
  vintedTitle: string;
  description: string;
  shortDescription: string;
  category: string;
  keywords: string[];
  etsyTags: string[];
  
  // Item Details
  brand?: string;
  model?: string;
  era?: string;
  itemSpecifics: ItemSpecific[];
  
  // Valuation
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'For Parts';
  conditionNotes: string;
  estimatedPrice: Pricing;
  
  // Flip Verdict
  profitPotential: 'High' | 'Medium' | 'Low';
  demandLevel: 'High Demand' | 'Steady' | 'Slow Mover';
  vintedParcelSize: 'Small' | 'Medium' | 'Large';
  
  platformSuitability?: PlatformSuitability;
  arbitrage?: ArbitrageAnalysis;
  searchQueries?: string[]; 
  verifiedSources?: SearchSource[];
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video';
  url: string;      // For display/preview
  base64?: string;  // For AI analysis
  mimeType?: string;
  file?: File;      // Original file object
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type ViewState = 'SCANNER' | 'USER_DASH' | 'ADMIN_DASH' | 'LANDING';

export interface AnalysisError {
  message: string;
  details?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  scans_used: number;
  scans_limit: number;
}

export interface AdminStats {
  mrr: number;
  totalUsers: number;
  activeUsers24h: number;
  totalScans: number;
}