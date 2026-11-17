import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Clock,
  Copy,
  Loader2,
  Package,
  Plus,
  Save,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  GeneratedRecipe,
  PackagingFormat,
  UmkmPartner,
  UserAccount,
} from '../../types';
import { formatRp } from '../../utils/format';

interface RecipeGeneratorViewProps {
  umkmPartners: UmkmPartner[];
  rawMaterials: string[];
  currentUser: UserAccount;
  historyRecipes: GeneratedRecipe[];
  onAddHistoryRecipes: (recipes: GeneratedRecipe[]) => void;
  onRateRecipe: (recipeId: string, rating: number) => void;
  onQuotaIncrement: (used: number) => void;
  onSendToPackaging: (recipe: GeneratedRecipe, brandName: string) => void;
  onSaveRecipeToCatalog: (
    recipe: GeneratedRecipe,
    brandName: string,
    umkmId: string
  ) => void;
}

const KITCHEN_TOOLS = [
  'Wajan & Kompor Rumahan',
  'Kukusan / Dandang',
  'Oven Listrik / Tangkring',
  'Air Fryer',
  'Blender / Chopper',
  'Torch Makanan',
  'Sealer Plastik / Pouch',
];

const FLAVOR_TRENDS = [
  'Mentai Creamy',
  'Keju Lumer Mozarella',
  'Pedas Nampol Chili Oil',
  'Salted Egg Crispy',
  'Matcha & Tiramisu',
  'Sambal Matah & Daun Jeruk',
];

const TARGET_CONSUMERS = [
  'Pelajar & Gen Z',
  'Keluarga & Oleh-oleh',
  'Pekerja Kantoran',
  'Acara Desa & Pengajian',
];

export function RecipeGeneratorView({
  umkmPartners,
  rawMaterials,
  currentUser,
  historyRecipes,
  onAddHistoryRecipes,
  onRateRecipe,
  onQuotaIncrement,
  onSendToPackaging,
  onSaveRecipeToCatalog,
}: RecipeGeneratorViewProps) {
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    rawMaterials[0] ?? 'Singkong',
  ]);
  const [customIngredient, setCustomIngredient] = useState('');
  const [kitchenTools, setKitchenTools] = useState<string[]>([
    'Wajan & Kompor Rumahan',
    'Kukusan / Dandang',
  ]);
  const [targetConsumer, setTargetConsumer] = useState(TARGET_CONSUMERS[0]);
  const [flavorTrend, setFlavorTrend] = useState(FLAVOR_TRENDS[0]);
  const [budgetPerPortion, setBudgetPerPortion] = useState(10000);
  const [selectedUmkmId, setSelectedUmkmId] = useState(umkmPartners[0]?.id ?? '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [showHistory, setShowHistory] = useState(false);

  const selectedUmkm =
    umkmPartners.find((u) => u.id === selectedUmkmId) ?? umkmPartners[0];

  const toggleItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    val: string
  ) => {
    setList((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    );
  };

  const addCustomIngredient = () => {
    const trimmed = customIngredient.trim();
    if (!trimmed) return;
    if (!selectedIngredients.includes(trimmed)) {
      setSelectedIngredients((prev) => [...prev, trimmed]);
    }
    setCustomIngredient('');
  };

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      setErrorMsg('Pilih minimal satu bahan baku tradisional.');
      setWizardStep(1);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setWizardStep(3);

    try {
      const response = await fetch('/api/ai/recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          ingredients: selectedIngredients,
          kitchenTools:
            kitchenTools.length > 0 ? kitchenTools : ['Wajan & Kompor Rumahan'],
          targetConsumer,
          flavorTrend,
          budgetPerPortion,
          brandName: selectedUmkm?.businessName ?? 'UMKM Kuliner Wonoayu',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghasilkan ide resep.');
      }

      if (data.quota?.used) {
        onQuotaIncrement(data.quota.used);
      }

      const formatted: GeneratedRecipe[] = (data.recipes ?? []).map(
        (r: Record<string, unknown>, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          menuName: String(r.menuName ?? 'Menu Fusion Wonoayu'),
          baseIngredient: selectedIngredients.join(', '),
          flavorTrend,
          targetConsumer,
          kitchenTools,
          conceptSummary: String(r.conceptSummary ?? ''),
          servingSuggestion: String(r.servingSuggestion ?? ''),
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          steps: Array.isArray(r.steps) ? r.steps : [],
          hppBreakdown: (r.hppBreakdown as GeneratedRecipe['hppBreakdown']) ?? {
            ingredientsCost: 5000,
            packagingCost: 1800,
            operationalCost: 1200,
          },
          hppEstimate: Number(r.hppEstimate ?? 8000),
          suggestedPrice: Number(r.suggestedPrice ?? 16000),
          wholesalePrice: Number(r.wholesalePrice ?? 13500),
          marginPercent: Number(r.marginPercent ?? 50),
          shelfLife: String(r.shelfLife ?? '1-2 hari suhu ruang'),
          packagingSuggestion:
            (r.packagingSuggestion as PackagingFormat) || 'Standing Pouch Kraft',
          copywriting: (r.copywriting as GeneratedRecipe['copywriting']) ?? {
            instagramCaption: '',
            tiktokHook: '',
            tiktokScript30s: '',
            whatsappBroadcast: '',
            hashtags: [],
          },
          createdAt: new Date().toISOString().slice(0, 10),
        })
      );

      setRecipes(formatted);
      onAddHistoryRecipes(formatted);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungi server AI.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecipeText = (recipe: GeneratedRecipe) => {
    const fullText = `${recipe.menuName}\nBahan:\n${recipe.ingredients
      .map((i) => `- ${i.item}: ${i.amount}`)
      .join('\n')}\n\nLangkah:\n${recipe.steps
      .map((s, idx) => `${idx + 1}. ${s}`)
      .join('\n')}\n\nSaran Penyajian: ${recipe.servingSuggestion}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(recipe.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Wizard Stepper Header (PRD Section 7.1 & 8.1) */}
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { step: 1 as const, label: '1. Bahan & Alat Dapur' },
            { step: 2 as const, label: '2. Target & Tren Rasa' },
            { step: 3 as const, label: '3. Hasil 3 Menu Fusion' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setWizardStep(s.step)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                wizardStep === s.step
                  ? 'bg-[#C2410C] text-white'
                  : 'bg-[#FAF7F2] text-[#57534E] border border-[#E7DFD3] hover:text-[#1C1917]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg cursor-pointer whitespace-nowrap"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Riwayat Generasi ({historyRecipes.length})</span>
        </button>
      </div>

      {/* Saved Generation History Drawer (NFR-04 Reliability) */}
      {showHistory && historyRecipes.length > 0 && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#1C1917]">
              Riwayat Kreasi Resep AI Tersimpan
            </h3>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-xs font-semibold text-[#C2410C] cursor-pointer"
            >
              Tutup
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {historyRecipes.slice(0, 6).map((hr) => (
              <div
                key={hr.id}
                className="p-3 rounded-lg border border-[#E7DFD3] bg-[#FAF7F2] flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="font-display text-xs font-bold text-[#1C1917]">
                    {hr.menuName}
                  </div>
                  <div className="text-[11px] text-[#78716C] mt-0.5">
                    {hr.baseIngredient} · {hr.flavorTrend}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecipes([hr]);
                    setWizardStep(3);
                    setShowHistory(false);
                  }}
                  className="text-left text-xs font-semibold text-[#C2410C] hover:underline cursor-pointer"
                >
                  Buka Resep →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Bahan Baku & Alat Dapur */}
      {wizardStep === 1 && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              Langkah 1: Pilih Bahan Baku Lokal & Peralatan Dapur
            </h2>
            <p className="text-xs text-[#78716C] mt-1">
              AI akan menyesuaikan resep agar bisa langsung dipraktikkan memakai alat dapur yang Anda miliki.
            </p>
          </div>

          <div>
            <label htmlFor="wiz-umkm" className="block text-xs font-semibold text-[#1C1917] mb-1.5">
              Usaha UMKM Pemilik Inovasi
            </label>
            <select
              id="wiz-umkm"
              value={selectedUmkmId}
              onChange={(e) => setSelectedUmkmId(e.target.value)}
              className="w-full max-w-md px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            >
              {umkmPartners.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.businessName} ({u.village})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1C1917] mb-2">
              Pilih Bahan Baku Tradisional Lokal Wonoayu
            </span>
            <div className="flex flex-wrap gap-2">
              {rawMaterials.map((ing) => {
                const active = selectedIngredients.includes(ing);
                return (
                  <button
                    key={ing}
                    type="button"
                    onClick={() => toggleItem(selectedIngredients, setSelectedIngredients, ing)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#C2410C] text-white border-[#C2410C]'
                        : 'bg-[#FAF7F2] text-[#1C1917] border-[#E7DFD3] hover:border-[#C2410C]'
                    }`}
                  >
                    {ing}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2 max-w-md">
              <input
                type="text"
                value={customIngredient}
                onChange={(e) => setCustomIngredient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomIngredient();
                  }
                }}
                placeholder="Tambah bahan lain (mis. talas, sukun, ikan bandeng)..."
                className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
              />
              <button
                type="button"
                onClick={addCustomIngredient}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1C1917] mb-2">
              Alat Dapur yang Tersedia di Tempat Usaha
            </span>
            <div className="flex flex-wrap gap-2">
              {KITCHEN_TOOLS.map((tool) => {
                const active = kitchenTools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => toggleItem(kitchenTools, setKitchenTools, tool)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#047857] text-white border-[#047857]'
                        : 'bg-[#FAF7F2] text-[#57534E] border-[#E7DFD3] hover:border-[#047857]'
                    }`}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7DFD3] flex justify-end">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
            >
              <span>Lanjut ke Target & Rasa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Target Pasar, Tren Rasa & Budget */}
      {wizardStep === 2 && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-6 max-w-4xl">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              Langkah 2: Tentukan Target Pembeli & Tren Rasa Kekinian
            </h2>
            <p className="text-xs text-[#78716C] mt-1">
              Bahan dipilih: <strong className="text-[#1C1917]">{selectedIngredients.join(', ')}</strong>
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1C1917] mb-2">
              Target Konsumen Utama
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TARGET_CONSUMERS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTargetConsumer(c)}
                  className={`px-3.5 py-2.5 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                    targetConsumer === c
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-semibold'
                      : 'bg-[#FAF7F2] text-[#1C1917] border-[#E7DFD3]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#1C1917] mb-2">
              Tren Rasa Kekinian
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {FLAVOR_TRENDS.map((trend) => (
                <button
                  key={trend}
                  type="button"
                  onClick={() => setFlavorTrend(trend)}
                  className={`px-3.5 py-2.5 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                    flavorTrend === trend
                      ? 'bg-orange-50 text-[#C2410C] border-[#C2410C] font-semibold'
                      : 'bg-[#FAF7F2] text-[#57534E] border-[#E7DFD3]'
                  }`}
                >
                  {trend}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="wiz-hpp" className="font-semibold text-[#1C1917]">
                Maksimal Modal HPP per Porsi
              </label>
              <span className="font-mono tabular-nums font-bold text-[#C2410C]">
                {formatRp(budgetPerPortion)}
              </span>
            </div>
            <input
              id="wiz-hpp"
              type="range"
              min={3000}
              max={25000}
              step={500}
              value={budgetPerPortion}
              onChange={(e) => setBudgetPerPortion(Number(e.target.value))}
              className="w-full accent-[#C2410C]"
            />
          </div>

          <div className="pt-3 border-t border-[#E7DFD3] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#57534E] bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate 3 Resep Fusion AI</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: 3 Generated Fusion Recipes */}
      {wizardStep === 3 && (
        <div className="space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setWizardStep(2)}
                className="font-semibold underline cursor-pointer"
              >
                Ubah Parameter
              </button>
            </div>
          )}

          {isLoading && (
            <div className="bg-white border border-[#E7DFD3] rounded-xl p-10 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#C2410C] animate-spin mx-auto" />
              <div className="font-display text-base font-bold text-[#1C1917]">
                Meracik 3 Menu Fusion Modern untuk {selectedUmkm?.businessName}...
              </div>
              <p className="text-xs text-[#78716C]">
                Menghitung takaran gramasi, rincian HPP, saran penyajian, dan paket promosi.
              </p>
            </div>
          )}

          {!isLoading && recipes.length === 0 && !errorMsg && (
            <div className="bg-white border border-[#E7DFD3] rounded-xl p-10 text-center space-y-3">
              <ChefHat className="w-10 h-10 text-[#C2410C] mx-auto" />
              <h3 className="font-display text-base font-bold text-[#1C1917]">
                Belum Ada Resep yang Dihasilkan
              </h3>
              <button
                type="button"
                onClick={() => setWizardStep(1)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] rounded-lg cursor-pointer"
              >
                Mulai dari Langkah 1
              </button>
            </div>
          )}

          {!isLoading &&
            recipes.map((recipe, rIdx) => (
              <article
                key={recipe.id}
                className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-[#E7DFD3]">
                  <div className="space-y-1.5">
                    <div className="text-xs font-medium text-[#C2410C]">
                      Rekomendasi {rIdx + 1} · {recipe.flavorTrend} · {recipe.targetConsumer} ·{' '}
                      {recipe.shelfLife}
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#1C1917]">
                      {recipe.menuName}
                    </h3>
                    <p className="text-sm text-[#57534E]">{recipe.conceptSummary}</p>
                  </div>

                  {/* HPP & Harga Jual Detail (FR-15) */}
                  <div className="shrink-0 bg-[#FAF7F2] border border-[#E7DFD3] rounded-xl p-4 min-w-[230px] font-mono tabular-nums text-xs space-y-1">
                    <div className="flex justify-between text-[#78716C]">
                      <span>Bahan Baku</span>
                      <span>{formatRp(recipe.hppBreakdown.ingredientsCost)}</span>
                    </div>
                    <div className="flex justify-between text-[#78716C]">
                      <span>Kemasan & Label</span>
                      <span>{formatRp(recipe.hppBreakdown.packagingCost)}</span>
                    </div>
                    <div className="flex justify-between text-[#78716C]">
                      <span>Gas/Operasional</span>
                      <span>{formatRp(recipe.hppBreakdown.operationalCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1C1917] pt-1 border-t border-[#E7DFD3]">
                      <span>Total HPP</span>
                      <span>{formatRp(recipe.hppEstimate)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#C2410C]">
                      <span>Jual Eceran</span>
                      <span>{formatRp(recipe.suggestedPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[#1E3A5F]">
                      <span>Jual Grosir</span>
                      <span>{formatRp(recipe.wholesalePrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#047857]">
                      <span>Margin</span>
                      <span>{recipe.marginPercent}%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-display text-sm font-bold text-[#1C1917] mb-2">
                      Takaran Bahan
                    </h4>
                    <ul className="space-y-1.5 text-xs">
                      {recipe.ingredients.map((ing, i) => (
                        <li
                          key={i}
                          className="flex justify-between py-1 border-b border-[#FAF7F2]"
                        >
                          <span className="text-[#1C1917]">{ing.item}</span>
                          <span className="font-mono font-semibold text-[#C2410C]">
                            {ing.amount}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-display text-sm font-bold text-[#1C1917] mb-2">
                        Langkah Pembuatan
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-[#57534E]">
                        {recipe.steps.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E7DFD3] text-xs">
                      <strong className="text-[#1E3A5F]">Saran Penyajian:</strong>{' '}
                      <span className="text-[#57534E]">{recipe.servingSuggestion}</span>
                    </div>
                  </div>
                </div>

                {/* Rating Kepuasan (FR-12) & Action Bar */}
                <div className="pt-3 border-t border-[#E7DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#78716C]">Nilai kepuasan hasil AI:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          aria-label={`Beri ${star} bintang`}
                          onClick={() => {
                            onRateRecipe(recipe.id, star);
                            setRecipes((prev) =>
                              prev.map((x) =>
                                x.id === recipe.id ? { ...x, rating: star } : x
                              )
                            );
                          }}
                          className="p-0.5 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              (recipe.rating ?? 0) >= star
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-[#D6D3D1]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => copyRecipeText(recipe)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1C1917] border border-[#E7DFD3] hover:bg-[#FAF7F2] rounded-lg cursor-pointer"
                    >
                      {copiedId === recipe.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#047857]" />
                          <span>Resep Disalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Resep</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSaveRecipeToCatalog(
                          recipe,
                          selectedUmkm?.businessName ?? 'UMKM Wonoayu',
                          selectedUmkm?.id ?? 'umkm-1'
                        );
                        setSavedIds((prev) => ({ ...prev, [recipe.id]: true }));
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg cursor-pointer"
                    >
                      {savedIds[recipe.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#047857]" />
                          <span>Di Katalog</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan ke Katalog</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onSendToPackaging(
                          recipe,
                          selectedUmkm?.businessName ?? 'UMKM Wonoayu'
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>Lanjut Desain Kemasan AI</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}
