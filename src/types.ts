export type NavSection =
  | 'dashboard'
  | 'recipes'
  | 'packaging'
  | 'promo'
  | 'catalog'
  | 'curation'
  | 'analytics'
  | 'reports'
  | 'settings';

export type UserRole =
  | 'Admin Sistem'
  | 'Koordinator / Manager'
  | 'Pendamping UMKM'
  | 'Pelaku UMKM'
  | 'Viewer / Pimpinan';

export interface UserAccount {
  id: string;
  name: string;
  phoneWhatsapp: string;
  email: string;
  role: UserRole;
  village: string;
  umkmId?: string;
  dailyQuotaUsed: number;
  dailyQuotaLimit: number;
  createdAt: string;
}

export type ProductLifecycleStatus =
  | 'Draf Ide'
  | 'Uji Coba Dapur'
  | 'Kemasan Siap'
  | 'Terkurasi'
  | 'Siap Bazar';

export type PackagingStatus = 'Siap Cetak' | 'Review Desain' | 'Draft';

export type PackagingFormat =
  | 'Standing Pouch Kraft'
  | 'Lunch Box Kraft'
  | 'Cup Bowl Kraft'
  | 'Jar Kaca Label';

export type PackagingAssetTab = 'mockup' | 'sticker' | 'logo';

export type PackagingStyle =
  | 'Kraft Natural'
  | 'Emerald Modern'
  | 'Streetfood Bold'
  | 'Minimalis Elegan';

export interface PackagingDesignSpec {
  productName: string;
  brandName: string;
  flavorVariant: string;
  tagline: string;
  netWeight: string;
  pirtNumber: string;
  contactWhatsapp: string;
  ingredientsSummary: string;
  calloutBadge: string;
  format: PackagingFormat;
  style: PackagingStyle;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  kraftTexture: boolean;
  showCutLine: boolean;
  emblemPaths: string[];
  emblemCaption?: string;
}

export interface PromoCopywriting {
  instagramCaption: string;
  tiktokHook: string;
  tiktokScript30s: string;
  whatsappBroadcast: string;
  hashtags: string[];
}

export interface MarketingContentRecord {
  id: string;
  umkmId: string;
  productName: string;
  platform: 'Instagram & TikTok' | 'WhatsApp' | 'Semua Kanal';
  tone: string;
  copywriting: PromoCopywriting;
  rating?: number;
  createdAt: string;
}

export interface GeneratedRecipe {
  id: string;
  menuName: string;
  baseIngredient: string;
  flavorTrend: string;
  targetConsumer: string;
  kitchenTools: string[];
  conceptSummary: string;
  servingSuggestion: string;
  ingredients: { item: string; amount: string }[];
  steps: string[];
  hppBreakdown: {
    ingredientsCost: number;
    packagingCost: number;
    operationalCost: number;
  };
  hppEstimate: number;
  suggestedPrice: number;
  wholesalePrice: number;
  marginPercent: number;
  shelfLife: string;
  packagingSuggestion: PackagingFormat;
  copywriting: PromoCopywriting;
  rating?: number;
  createdAt?: string;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  brandName: string;
  umkmId: string;
  baseIngredient: string;
  flavorTrend: string;
  targetConsumer: string;
  kitchenTools: string[];
  servingSuggestion: string;
  hppBreakdown: {
    ingredientsCost: number;
    packagingCost: number;
    operationalCost: number;
  };
  hpp: number;
  sellingPrice: number;
  wholesalePrice: number;
  marginPercent: number;
  lifecycleStatus: ProductLifecycleStatus;
  packagingStatus: PackagingStatus;
  packagingFormat: PackagingFormat;
  imageUrl?: string;
  designSpec: PackagingDesignSpec;
  copywriting: PromoCopywriting;
  aiRating?: number;
  createdAt: string;
  monthlySalesEstimate: number;
  digitalReach: number;
}

export type UmkmStatus = 'Naik Kelas' | 'Pendampingan' | 'Baru Bergabung';

export interface UmkmPartner {
  id: string;
  businessName: string;
  ownerName: string;
  village: string;
  mainCommodity: string;
  status: UmkmStatus;
  phone: string;
  instagramHandle: string;
  monthlyRevenueRp: number;
  readiness: {
    nib: boolean;
    pirt: boolean;
    halal: boolean;
    modernPackaging: boolean;
    digitalCatalog: boolean;
  };
  joinedDate: string;
}

export interface KitchenTrial {
  id: string;
  productId: string;
  umkmId: string;
  productName: string;
  brandName: string;
  trialDate: string;
  actualPhotoUrl?: string;
  finalSellingPrice: number;
  tasteAdjustment: string;
  kitchenStatus: 'Berhasil' | 'Perlu Penyesuaian' | 'Siap Diajukan Kurasi';
  notes: string;
}

export interface CurationRecord {
  id: string;
  trialId: string;
  productId: string;
  productName: string;
  brandName: string;
  curatorName: string;
  packagingScore: number;
  innovationScore: number;
  decision: 'Terkurasi' | 'Siap Bazar' | 'Perlu Revisi';
  feedbackNote: string;
  curatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  userName: string;
  role: UserRole;
  action: string;
  entity: string;
  detail: string;
  timestamp: string;
}

export interface FlavorTrendSeries {
  month: string;
  mentai: number;
  kejuLumer: number;
  pedasNampol: number;
  matchaTiramisu: number;
  saltedEgg: number;
}

export interface MarketingChannelStat {
  channel: string;
  reach: number;
  clicks: number;
  orders: number;
  conversionRate: number;
}

export interface BusinessInsight {
  id: string;
  category:
    | 'Komoditas Dominan'
    | 'Rasio Draf vs Realisasi'
    | 'Kesiapan Kemasan'
    | 'Kesenjangan Legalitas'
    | 'Desa Partisipasi Rendah'
    | 'Peluang Pasar';
  title: string;
  finding: string;
  recommendation: string;
  expectedImpact: string;
  priority: 'Tinggi' | 'Sedang';
}

export interface MarketAnalysisResult {
  keyword: string;
  demandLevel: 'Sangat Tinggi' | 'Tinggi' | 'Stabil' | 'Niche';
  demandIndex: number;
  recommendedPriceRange: string;
  peakHours: string;
  targetAudienceProfile: string;
  competitorGap: string;
  differentiationIdeas: string[];
  localChannelStrategy: string;
}

export interface ManagementBrief {
  period: string;
  executiveSummary: string;
  kpiHighlights: string;
  regionalSpread: string;
  commodityAndFlavorTrends: string;
  packagingAdoption: string;
  legalityReadiness: string;
  keyInsights: string;
  actionRecommendations: string[];
  closingNote: string;
  generatedAt: string;
}

export interface AppSettings {
  regionName: string;
  coordinatorName: string;
  defaultUnitWeight: 'gram' | 'ml' | 'pcs';
  defaultExportFormat: 'PNG' | 'SVG';
  defaultStickerSize: string;
  dailyAiQuotaLimit: number;
  autoIncludeHalalLogo: boolean;
  masterRawMaterials: string[];
  masterVillages: string[];
}
