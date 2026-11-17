import React, { useEffect, useState } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CatalogView } from './components/views/CatalogView';
import { CurationTrialView } from './components/views/CurationTrialView';
import { DashboardView } from './components/views/DashboardView';
import { MarketAnalyticsView } from './components/views/MarketAnalyticsView';
import { PackagingStudioView } from './components/views/PackagingStudioView';
import { PromoContentView } from './components/views/PromoContentView';
import { RecipeGeneratorView } from './components/views/RecipeGeneratorView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import {
  FLAVOR_TRENDS_DATA,
  INITIAL_AUDIT_LOGS,
  INITIAL_BRIEF,
  INITIAL_CATALOG,
  INITIAL_CURATIONS,
  INITIAL_INSIGHTS,
  INITIAL_MARKETING_CONTENTS,
  INITIAL_SETTINGS,
  INITIAL_TRIALS,
  INITIAL_UMKM_PARTNERS,
  INITIAL_USERS,
  MARKETING_CHANNELS,
} from './data/seedData';
import {
  AppSettings,
  AuditLogEntry,
  BusinessInsight,
  CurationRecord,
  GeneratedRecipe,
  KitchenTrial,
  ManagementBrief,
  MarketingContentRecord,
  NavSection,
  PackagingDesignSpec,
  ProductCatalogItem,
  ProductLifecycleStatus,
  UmkmPartner,
  UserAccount,
  UserRole,
} from './types';

const STORAGE_KEY = 'kemaskini-prd-state-v2';

interface PersistedState {
  users: UserAccount[];
  currentUserId: string;
  catalog: ProductCatalogItem[];
  umkmPartners: UmkmPartner[];
  trials: KitchenTrial[];
  curations: CurationRecord[];
  marketingContents: MarketingContentRecord[];
  recipeHistory: GeneratedRecipe[];
  insights: BusinessInsight[];
  brief: ManagementBrief;
  auditLogs: AuditLogEntry[];
  settings: AppSettings;
}

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(INITIAL_USERS[0].id);
  const [catalog, setCatalog] = useState<ProductCatalogItem[]>(INITIAL_CATALOG);
  const [umkmPartners, setUmkmPartners] = useState<UmkmPartner[]>(INITIAL_UMKM_PARTNERS);
  const [trials, setTrials] = useState<KitchenTrial[]>(INITIAL_TRIALS);
  const [curations, setCurations] = useState<CurationRecord[]>(INITIAL_CURATIONS);
  const [marketingContents, setMarketingContents] = useState<MarketingContentRecord[]>(
    INITIAL_MARKETING_CONTENTS
  );
  const [recipeHistory, setRecipeHistory] = useState<GeneratedRecipe[]>([]);
  const [insights, setInsights] = useState<BusinessInsight[]>(INITIAL_INSIGHTS);
  const [brief, setBrief] = useState<ManagementBrief>(INITIAL_BRIEF);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  const [activeDesignSpec, setActiveDesignSpec] = useState<PackagingDesignSpec>(
    INITIAL_CATALOG[0].designSpec
  );
  const [pendingRecipeForCatalog, setPendingRecipeForCatalog] =
    useState<GeneratedRecipe | null>(null);
  const [preselectedTrialProductId, setPreselectedTrialProductId] = useState<string | undefined>(
    undefined
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentUser = users.find((u) => u.id === currentUserId) ?? users[0];

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const addAuditLog = (action: string, entity: string, detail: string, user = currentUser) => {
    const entry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userName: user.name,
      role: user.role,
      action,
      entity,
      detail,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 49)]);
  };

  const handleQuotaIncrement = (used: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, dailyQuotaUsed: used } : u))
    );
  };

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const localRaw = localStorage.getItem(STORAGE_KEY);
        if (localRaw) {
          const parsed = JSON.parse(localRaw) as Partial<PersistedState>;
          if (parsed.users?.length) setUsers(parsed.users);
          if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
          if (parsed.catalog?.length) setCatalog(parsed.catalog);
          if (parsed.umkmPartners?.length) setUmkmPartners(parsed.umkmPartners);
          if (parsed.trials?.length) setTrials(parsed.trials);
          if (parsed.curations?.length) setCurations(parsed.curations);
          if (parsed.marketingContents?.length) setMarketingContents(parsed.marketingContents);
          if (parsed.recipeHistory?.length) setRecipeHistory(parsed.recipeHistory);
          if (parsed.insights?.length) setInsights(parsed.insights);
          if (parsed.brief) setBrief(parsed.brief);
          if (parsed.auditLogs?.length) setAuditLogs(parsed.auditLogs);
          if (parsed.settings) setSettings(parsed.settings);
        }

        const res = await fetch('/api/state');
        if (res.ok) {
          const json = await res.json();
          if (active && json.exists && json.data?.users?.length) {
            const srv = json.data as Partial<PersistedState>;
            if (srv.users?.length) setUsers(srv.users);
            if (srv.currentUserId) setCurrentUserId(srv.currentUserId);
            if (srv.catalog?.length) setCatalog(srv.catalog);
            if (srv.umkmPartners?.length) setUmkmPartners(srv.umkmPartners);
            if (srv.trials?.length) setTrials(srv.trials);
            if (srv.curations?.length) setCurations(srv.curations);
            if (srv.marketingContents?.length) setMarketingContents(srv.marketingContents);
            if (srv.recipeHistory?.length) setRecipeHistory(srv.recipeHistory);
            if (srv.insights?.length) setInsights(srv.insights);
            if (srv.brief) setBrief(srv.brief);
            if (srv.auditLogs?.length) setAuditLogs(srv.auditLogs);
            if (srv.settings) setSettings(srv.settings);
          }
        }
      } catch {
        // Keep seeded defaults
      } finally {
        if (active) setHydrated(true);
      }
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedState = {
      users,
      currentUserId,
      catalog,
      umkmPartners,
      trials,
      curations,
      marketingContents,
      recipeHistory,
      insights,
      brief,
      auditLogs,
      settings,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {
      // Ignore quota errors
    }
  }, [
    users,
    currentUserId,
    catalog,
    umkmPartners,
    trials,
    curations,
    marketingContents,
    recipeHistory,
    insights,
    brief,
    auditLogs,
    settings,
    hydrated,
  ]);

  const filteredCatalog = searchQuery.trim()
    ? catalog.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brandName.toLowerCase().includes(q) ||
          p.baseIngredient.toLowerCase().includes(q) ||
          p.flavorTrend.toLowerCase().includes(q)
        );
      })
    : catalog;

  const handleRegisterUser = (payload: {
    name: string;
    phoneWhatsapp: string;
    email: string;
    role: UserRole;
    village: string;
    businessName?: string;
    mainCommodity?: string;
  }) => {
    let umkmId: string | undefined;
    if (payload.businessName) {
      umkmId = `umkm-${Date.now()}`;
      const newUmkm: UmkmPartner = {
        id: umkmId,
        businessName: payload.businessName,
        ownerName: payload.name,
        village: payload.village,
        mainCommodity: payload.mainCommodity || 'Olahan Lokal Wonoayu',
        status: 'Baru Bergabung',
        phone: payload.phoneWhatsapp,
        instagramHandle: `@${payload.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        monthlyRevenueRp: 5500000,
        readiness: {
          nib: false,
          pirt: false,
          halal: false,
          modernPackaging: false,
          digitalCatalog: false,
        },
        joinedDate: new Date().toISOString().slice(0, 10),
      };
      setUmkmPartners((prev) => [newUmkm, ...prev]);
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: payload.name,
      phoneWhatsapp: payload.phoneWhatsapp,
      email: payload.email,
      role: payload.role,
      village: payload.village,
      umkmId,
      dailyQuotaUsed: 0,
      dailyQuotaLimit: settings.dailyAiQuotaLimit,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    addAuditLog(
      'REGISTRASI_AKUN',
      'users',
      `Mendaftarkan akun ${newUser.name} (${newUser.role}) di ${newUser.village}.`,
      newUser
    );
    notify(`Selamat datang, ${newUser.name} (${newUser.role})!`);
  };

  const handleSaveRecipeToCatalog = (
    recipe: GeneratedRecipe,
    brandName: string,
    umkmId: string
  ) => {
    const newItem: ProductCatalogItem = {
      id: `prod-${Date.now()}`,
      name: recipe.menuName,
      brandName,
      umkmId,
      baseIngredient: recipe.baseIngredient,
      flavorTrend: recipe.flavorTrend,
      targetConsumer: recipe.targetConsumer,
      kitchenTools: recipe.kitchenTools,
      servingSuggestion: recipe.servingSuggestion,
      hppBreakdown: recipe.hppBreakdown,
      hpp: recipe.hppEstimate,
      sellingPrice: recipe.suggestedPrice,
      wholesalePrice: recipe.wholesalePrice,
      marginPercent: recipe.marginPercent,
      lifecycleStatus: 'Draf Ide',
      packagingStatus: 'Draft',
      packagingFormat: recipe.packagingSuggestion,
      aiRating: recipe.rating,
      createdAt: new Date().toISOString().slice(0, 10),
      monthlySalesEstimate: 220,
      digitalReach: 4500,
      copywriting: recipe.copywriting,
      designSpec: {
        productName: recipe.menuName,
        brandName,
        flavorVariant: recipe.flavorTrend,
        tagline: `Kreasi Lokal ${brandName} Wonoayu`,
        netWeight: '180 g',
        pirtNumber: 'Produksi Wonoayu, Sidoarjo',
        contactWhatsapp: currentUser.phoneWhatsapp,
        ingredientsSummary: recipe.ingredients.map((i) => i.item).join(', '),
        calloutBadge: 'Inovasi Fusion Lokal',
        format: recipe.packagingSuggestion,
        style: 'Kraft Natural',
        primaryColor: '#C2410C',
        secondaryColor: '#F4ECE1',
        accentColor: '#047857',
        kraftTexture: true,
        showCutLine: false,
        emblemPaths: [
          'M60 22 C44 34 40 58 52 76 C58 84 62 84 68 76 C80 58 76 34 60 22 Z',
          'M60 32 L60 76',
          'M46 52 Q60 60 74 52',
        ],
        emblemCaption: 'Kuliner Khas Wonoayu',
      },
    };
    setCatalog((prev) => [newItem, ...prev]);
    addAuditLog('SIMPAN_KATALOG_RESEP', 'recipe_generations', `Menyimpan ${recipe.menuName} ke katalog.`);
    notify(`"${recipe.menuName}" disimpan ke Katalog Produk Saya.`);
  };

  const handleSendRecipeToPackaging = (recipe: GeneratedRecipe, brandName: string) => {
    setPendingRecipeForCatalog(recipe);
    setActiveDesignSpec({
      productName: recipe.menuName,
      brandName,
      flavorVariant: recipe.flavorTrend,
      tagline: `Inovasi ${recipe.baseIngredient} Kekinian`,
      netWeight: '180 g',
      pirtNumber: 'Produksi Wonoayu, Sidoarjo',
      contactWhatsapp: currentUser.phoneWhatsapp,
      ingredientsSummary: recipe.ingredients.map((i) => i.item).join(', '),
      calloutBadge: 'Produksi Wonoayu',
      format: recipe.packagingSuggestion,
      style: 'Kraft Natural',
      primaryColor: '#C2410C',
      secondaryColor: '#F4ECE1',
      accentColor: '#047857',
      kraftTexture: true,
      showCutLine: false,
      emblemPaths: [
        'M60 22 C44 34 40 58 52 76 C58 84 62 84 68 76 C80 58 76 34 60 22 Z',
        'M60 32 L60 76',
        'M46 52 Q60 60 74 52',
      ],
      emblemCaption: 'Kuliner Khas Wonoayu',
    });
    setActiveSection('packaging');
  };

  const handleSaveDesignToCatalog = (spec: PackagingDesignSpec, rating?: number) => {
    const existingIdx = catalog.findIndex(
      (c) => c.name.toLowerCase() === spec.productName.toLowerCase()
    );
    if (existingIdx >= 0) {
      const updated = [...catalog];
      updated[existingIdx] = {
        ...updated[existingIdx],
        brandName: spec.brandName,
        packagingFormat: spec.format,
        packagingStatus: 'Siap Cetak',
        lifecycleStatus:
          updated[existingIdx].lifecycleStatus === 'Draf Ide'
            ? 'Kemasan Siap'
            : updated[existingIdx].lifecycleStatus,
        designSpec: spec,
        aiRating: rating ?? updated[existingIdx].aiRating,
      };
      setCatalog(updated);
      addAuditLog('SIMPAN_DESAIN_KEMASAN', 'packaging_designs', `Memperbarui kemasan ${spec.productName}.`);
      notify(`Desain kemasan "${spec.productName}" diperbarui.`);
      return;
    }

    const newItem: ProductCatalogItem = {
      id: `prod-${Date.now()}`,
      name: spec.productName,
      brandName: spec.brandName,
      umkmId: currentUser.umkmId ?? umkmPartners[0]?.id ?? 'umkm-1',
      baseIngredient: pendingRecipeForCatalog?.baseIngredient ?? 'Bahan Lokal Wonoayu',
      flavorTrend: spec.flavorVariant,
      targetConsumer: pendingRecipeForCatalog?.targetConsumer ?? 'Pelajar & Keluarga',
      kitchenTools: pendingRecipeForCatalog?.kitchenTools ?? ['Wajan & Kompor Rumahan'],
      servingSuggestion:
        pendingRecipeForCatalog?.servingSuggestion ?? 'Sajikan hangat dengan label merek baru.',
      hppBreakdown: pendingRecipeForCatalog?.hppBreakdown ?? {
        ingredientsCost: 5500,
        packagingCost: 2000,
        operationalCost: 1000,
      },
      hpp: pendingRecipeForCatalog?.hppEstimate ?? 8500,
      sellingPrice: pendingRecipeForCatalog?.suggestedPrice ?? 17000,
      wholesalePrice: pendingRecipeForCatalog?.wholesalePrice ?? 14500,
      marginPercent: pendingRecipeForCatalog?.marginPercent ?? 50,
      lifecycleStatus: 'Kemasan Siap',
      packagingStatus: 'Siap Cetak',
      packagingFormat: spec.format,
      designSpec: spec,
      aiRating: rating,
      copywriting: pendingRecipeForCatalog?.copywriting ?? {
        instagramCaption: `Cobain menu terbaru ${spec.productName} dari ${spec.brandName}!`,
        tiktokHook: `Kemasan baru ${spec.productName} resmi meluncur di Wonoayu!`,
        tiktokScript30s: `[0-3s Hook]: Tunjukkan kemasan baru ${spec.productName}.\n[4-20s Isi]: Olahan lokal Wonoayu dengan tampilan kekinian.\n[21-30s CTA]: Pesan sekarang via WhatsApp ${spec.contactWhatsapp}!`,
        whatsappBroadcast: `Halo! ${spec.productName} sudah siap dipesan lewat WhatsApp ${spec.contactWhatsapp}.`,
        hashtags: ['#KemasKiniWonoayu', '#UMKMNaikKelas'],
      },
      createdAt: new Date().toISOString().slice(0, 10),
      monthlySalesEstimate: 250,
      digitalReach: 5200,
    };

    setCatalog((prev) => [newItem, ...prev]);
    setPendingRecipeForCatalog(null);
    addAuditLog('SIMPAN_DESAIN_KEMASAN', 'packaging_designs', `Menambahkan produk & kemasan ${spec.productName}.`);
    notify(`Produk & desain "${spec.productName}" berhasil disimpan.`);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex bg-[#FAF7F2] text-[#1C1917] pb-16 lg:pb-0">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          catalogCount={catalog.length}
          trialCount={trials.length}
          currentUser={currentUser}
          onOpenAuthModal={() => setAuthModalOpen(true)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            activeSection={activeSection}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onQuickCreate={() => setActiveSection('recipes')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1380px] w-full mx-auto">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'dashboard' && (
                <DashboardView
                  catalog={filteredCatalog}
                  umkmPartners={umkmPartners}
                  curations={curations}
                  flavorTrends={FLAVOR_TRENDS_DATA}
                  onNavigate={setActiveSection}
                  onOpenProductInPackaging={(product) => {
                    setActiveDesignSpec(product.designSpec);
                    setActiveSection('packaging');
                  }}
                />
              )}

              {activeSection === 'recipes' && (
                <RecipeGeneratorView
                  umkmPartners={umkmPartners}
                  rawMaterials={settings.masterRawMaterials}
                  currentUser={currentUser}
                  historyRecipes={recipeHistory}
                  onAddHistoryRecipes={(newList) => {
                    setRecipeHistory((prev) => [...newList, ...prev].slice(0, 30));
                    addAuditLog(
                      'GENERATE_RESEP_AI',
                      'recipe_generations',
                      `Membuat ${newList.length} rekomendasi resep fusion AI.`
                    );
                  }}
                  onRateRecipe={(recipeId, rating) => {
                    setRecipeHistory((prev) =>
                      prev.map((r) => (r.id === recipeId ? { ...r, rating } : r))
                    );
                    notify(`Rating ${rating}/5 tersimpan.`);
                  }}
                  onQuotaIncrement={handleQuotaIncrement}
                  onSendToPackaging={handleSendRecipeToPackaging}
                  onSaveRecipeToCatalog={handleSaveRecipeToCatalog}
                />
              )}

              {activeSection === 'packaging' && (
                <PackagingStudioView
                  spec={activeDesignSpec}
                  onChangeSpec={setActiveDesignSpec}
                  umkmPartners={umkmPartners}
                  currentUser={currentUser}
                  onQuotaIncrement={handleQuotaIncrement}
                  onSaveDesignToCatalog={handleSaveDesignToCatalog}
                />
              )}

              {activeSection === 'promo' && (
                <PromoContentView
                  catalog={filteredCatalog}
                  marketingHistory={marketingContents}
                  currentUser={currentUser}
                  onQuotaIncrement={handleQuotaIncrement}
                  onSaveContent={(record) => {
                    setMarketingContents((prev) => [record, ...prev]);
                    addAuditLog(
                      'GENERATE_KONTEN_PROMOSI',
                      'marketing_contents',
                      `Membuat paket konten promosi untuk ${record.productName}.`
                    );
                  }}
                  onRateContent={(id, rating) => {
                    setMarketingContents((prev) =>
                      prev.map((m) => (m.id === id ? { ...m, rating } : m))
                    );
                    notify(`Rating konten ${rating}/5 tersimpan.`);
                  }}
                />
              )}

              {activeSection === 'catalog' && (
                <CatalogView
                  catalog={filteredCatalog}
                  umkmPartners={umkmPartners}
                  onOpenPackaging={(product) => {
                    setActiveDesignSpec(product.designSpec);
                    setActiveSection('packaging');
                  }}
                  onOpenTrial={(product) => {
                    setPreselectedTrialProductId(product.id);
                    setActiveSection('curation');
                  }}
                  onUpdatePricing={(productId, hppBreakdown, sellingPrice, wholesalePrice) => {
                    const totalHpp =
                      hppBreakdown.ingredientsCost +
                      hppBreakdown.packagingCost +
                      hppBreakdown.operationalCost;
                    const margin = Math.round(
                      ((sellingPrice - totalHpp) / Math.max(sellingPrice, 1)) * 100
                    );
                    setCatalog((prev) =>
                      prev.map((p) =>
                        p.id === productId
                          ? {
                              ...p,
                              hppBreakdown,
                              hpp: totalHpp,
                              sellingPrice,
                              wholesalePrice,
                              marginPercent: margin,
                            }
                          : p
                      )
                    );
                    notify('Kalkulasi HPP & harga jual diperbarui.');
                  }}
                  onUpdateStatus={(productId, lifecycleStatus: ProductLifecycleStatus) => {
                    setCatalog((prev) =>
                      prev.map((p) =>
                        p.id === productId ? { ...p, lifecycleStatus } : p
                      )
                    );
                    addAuditLog(
                      'UBAH_STATUS_PRODUK',
                      'catalog',
                      `Status produk diubah menjadi ${lifecycleStatus}.`
                    );
                  }}
                />
              )}

              {activeSection === 'curation' && (
                <CurationTrialView
                  catalog={catalog}
                  trials={trials}
                  curations={curations}
                  currentUser={currentUser}
                  preselectedProductId={preselectedTrialProductId}
                  onAddTrial={(trial) => {
                    const newTrial: KitchenTrial = {
                      ...trial,
                      id: `trial-${Date.now()}`,
                    };
                    setTrials((prev) => [newTrial, ...prev]);
                    setCatalog((prev) =>
                      prev.map((p) =>
                        p.id === trial.productId
                          ? {
                              ...p,
                              lifecycleStatus: 'Uji Coba Dapur',
                              sellingPrice: trial.finalSellingPrice,
                              imageUrl: trial.actualPhotoUrl || p.imageUrl,
                            }
                          : p
                      )
                    );
                    addAuditLog(
                      'CATAT_UJI_COBA_DAPUR',
                      'product_trials',
                      `Mencatat uji coba dapur untuk ${trial.productName}.`
                    );
                    notify(`Log uji coba "${trial.productName}" tersimpan.`);
                  }}
                  onAddCuration={(curation) => {
                    const newCur: CurationRecord = {
                      ...curation,
                      id: `cur-${Date.now()}`,
                    };
                    setCurations((prev) => [newCur, ...prev]);
                    setCatalog((prev) =>
                      prev.map((p) =>
                        p.id === curation.productId
                          ? {
                              ...p,
                              lifecycleStatus:
                                curation.decision === 'Siap Bazar'
                                  ? 'Siap Bazar'
                                  : curation.decision === 'Terkurasi'
                                    ? 'Terkurasi'
                                    : 'Uji Coba Dapur',
                            }
                          : p
                      )
                    );
                    addAuditLog(
                      'KURASI_PRODUK',
                      'curations',
                      `Keputusan "${curation.decision}" untuk ${curation.productName}.`
                    );
                    notify(`Kurasi "${curation.productName}" disimpan (${curation.decision}).`);
                  }}
                />
              )}

              {activeSection === 'analytics' && (
                <MarketAnalyticsView
                  flavorTrends={FLAVOR_TRENDS_DATA}
                  marketingChannels={MARKETING_CHANNELS}
                  insights={insights}
                  catalog={catalog}
                  umkmPartners={umkmPartners}
                  currentUser={currentUser}
                  onUpdateInsights={setInsights}
                  onQuotaIncrement={handleQuotaIncrement}
                />
              )}

              {activeSection === 'reports' && (
                <ReportsView
                  catalog={filteredCatalog}
                  umkmPartners={umkmPartners}
                  trials={trials}
                  curations={curations}
                  brief={brief}
                  currentUser={currentUser}
                  onUpdateBrief={(next) => {
                    setBrief(next);
                    addAuditLog(
                      'GENERATE_MANAGEMENT_BRIEF',
                      'reports',
                      `Menyusun Management Brief periode ${next.period}.`
                    );
                  }}
                  onQuotaIncrement={handleQuotaIncrement}
                />
              )}

              {activeSection === 'settings' && (
                <SettingsView
                  settings={settings}
                  currentUser={currentUser}
                  umkmPartners={umkmPartners}
                  auditLogs={auditLogs}
                  onSaveSettings={(next) => {
                    setSettings(next);
                    setUsers((prev) =>
                      prev.map((u) => ({ ...u, dailyQuotaLimit: next.dailyAiQuotaLimit }))
                    );
                    addAuditLog('UBAH_PENGATURAN', 'settings', 'Memperbarui master data & kuota sistem.');
                    notify('Pengaturan sistem berhasil diperbarui.');
                  }}
                  onAddUmkm={(partner) => {
                    setUmkmPartners((prev) => [
                      { ...partner, id: `umkm-${Date.now()}` },
                      ...prev,
                    ]);
                    addAuditLog(
                      'TAMBAH_UMKM',
                      'umkm_profiles',
                      `Mendaftarkan UMKM ${partner.businessName} (${partner.village}).`
                    );
                    notify(`UMKM "${partner.businessName}" berhasil ditambahkan.`);
                  }}
                  onToggleReadiness={(id, key) => {
                    setUmkmPartners((prev) =>
                      prev.map((u) =>
                        u.id === id
                          ? { ...u, readiness: { ...u.readiness, [key]: !u.readiness[key] } }
                          : u
                      )
                    );
                  }}
                  onExportBackup={() => {
                    const blob = new Blob(
                      [
                        JSON.stringify(
                          {
                            users,
                            catalog,
                            umkmPartners,
                            trials,
                            curations,
                            marketingContents,
                            insights,
                            brief,
                            auditLogs,
                            settings,
                          },
                          null,
                          2
                        ),
                      ],
                      { type: 'application/json' }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'kemaskini-wonoayu-backup.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    notify('Cadangan data JSON berhasil diunduh.');
                  }}
                  onResetDefaults={() => {
                    setUsers(INITIAL_USERS);
                    setCurrentUserId(INITIAL_USERS[0].id);
                    setCatalog(INITIAL_CATALOG);
                    setUmkmPartners(INITIAL_UMKM_PARTNERS);
                    setTrials(INITIAL_TRIALS);
                    setCurations(INITIAL_CURATIONS);
                    setMarketingContents(INITIAL_MARKETING_CONTENTS);
                    setInsights(INITIAL_INSIGHTS);
                    setBrief(INITIAL_BRIEF);
                    setAuditLogs(INITIAL_AUDIT_LOGS);
                    setSettings(INITIAL_SETTINGS);
                    localStorage.removeItem(STORAGE_KEY);
                    notify('Seluruh data dikembalikan ke dataset awal Wonoayu.');
                  }}
                />
              )}
            </motion.div>
          </main>
        </div>

        <MobileBottomNav
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        <AuthModal
          open={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          users={users}
          currentUser={currentUser}
          villages={settings.masterVillages}
          onSwitchUser={(u) => {
            setCurrentUserId(u.id);
            notify(`Aktif sebagai ${u.name} (${u.role})`);
          }}
          onRegisterUser={handleRegisterUser}
        />

        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-20 lg:bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-[#1E3A5F] text-white text-xs font-medium shadow-lg border border-white/15"
          >
            {toastMessage}
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
