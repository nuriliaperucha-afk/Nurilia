import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  FileCode2,
  Loader2,
  Palette,
  Save,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  PackagingAssetTab,
  PackagingDesignSpec,
  PackagingFormat,
  PackagingStyle,
  UmkmPartner,
  UserAccount,
} from '../../types';
import { downloadSvgAsPng, downloadSvgFile } from '../../utils/format';
import { PackagingPreviewCanvas } from '../PackagingPreviewCanvas';

interface PackagingStudioViewProps {
  spec: PackagingDesignSpec;
  onChangeSpec: (next: PackagingDesignSpec) => void;
  umkmPartners: UmkmPartner[];
  currentUser: UserAccount;
  onQuotaIncrement: (used: number) => void;
  onSaveDesignToCatalog: (spec: PackagingDesignSpec, rating?: number) => void;
}

const FORMAT_OPTIONS: PackagingFormat[] = [
  'Standing Pouch Kraft',
  'Lunch Box Kraft',
  'Cup Bowl Kraft',
  'Jar Kaca Label',
];

const STYLE_OPTIONS: PackagingStyle[] = [
  'Kraft Natural',
  'Emerald Modern',
  'Streetfood Bold',
  'Minimalis Elegan',
];

const PRESET_PALETTES = [
  { name: 'Terakota & Kraft', primary: '#C2410C', secondary: '#F4ECE1', accent: '#047857' },
  { name: 'Zamrud Kuliner', primary: '#047857', secondary: '#FAF7F2', accent: '#C2410C' },
  { name: 'Biru Tua Analitik', primary: '#1E3A5F', secondary: '#F4ECE1', accent: '#C2410C' },
  { name: 'Cokelat Artisan', primary: '#593B1F', secondary: '#F4ECE1', accent: '#047857' },
];

export function PackagingStudioView({
  spec,
  onChangeSpec,
  umkmPartners,
  currentUser,
  onQuotaIncrement,
  onSaveDesignToCatalog,
}: PackagingStudioViewProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeTab, setActiveTab] = useState<PackagingAssetTab>('mockup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);
  const [exportingPng, setExportingPng] = useState(false);
  const [rating, setRating] = useState(5);

  const updateField = <K extends keyof PackagingDesignSpec>(
    key: K,
    value: PackagingDesignSpec[K]
  ) => {
    onChangeSpec({ ...spec, [key]: value });
  };

  const handleGenerateAiConcept = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          productName: spec.productName,
          brandName: spec.brandName,
          flavorVariant: spec.flavorVariant,
          style: spec.style,
          format: spec.format,
          netWeight: spec.netWeight,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat desain kemasan AI.');
      }

      if (data.quota?.used) {
        onQuotaIncrement(data.quota.used);
      }

      const d = data.design ?? {};
      onChangeSpec({
        ...spec,
        tagline: d.tagline || spec.tagline,
        calloutBadge: d.calloutBadge || spec.calloutBadge,
        ingredientsSummary: d.ingredientsSummary || spec.ingredientsSummary,
        primaryColor: d.primaryColor || spec.primaryColor,
        secondaryColor: d.secondaryColor || spec.secondaryColor,
        accentColor: d.accentColor || spec.accentColor,
        emblemPaths:
          Array.isArray(d.emblemPaths) && d.emblemPaths.length > 0
            ? d.emblemPaths
            : spec.emblemPaths,
        emblemCaption: d.emblemCaption || spec.emblemCaption,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menghubungi AI Visual Generator.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!svgRef.current) return;
    setExportingPng(true);
    try {
      await downloadSvgAsPng(
        svgRef.current,
        `${spec.brandName}-${spec.productName}-${activeTab}`,
        2
      );
    } finally {
      setExportingPng(false);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    downloadSvgFile(svgRef.current, `${spec.brandName}-${spec.productName}-${activeTab}`);
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(
      `Konsep Kemasan Baru *${spec.brandName}* — ${spec.productName} (${spec.flavorVariant})\n` +
        `Format: ${spec.format} | Netto: ${spec.netWeight}\n` +
        `Tagline: "${spec.tagline}"\n` +
        `Produksi Wonoayu, Sidoarjo · Order WA: ${spec.contactWhatsapp}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    onSaveDesignToCatalog(spec, rating);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2200);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      <div className="xl:col-span-5 bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              AI Visual & Packaging Designer
            </h2>
            <p className="text-xs text-[#78716C] mt-1">
              Rancang konsep logo, mockup kemasan, dan stiker label berizin P-IRT/Halal produksi Wonoayu, Sidoarjo.
            </p>
          </div>
          <Palette className="w-5 h-5 text-[#C2410C] shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label htmlFor="pkg-product" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Nama Produk
            </label>
            <input
              id="pkg-product"
              type="text"
              value={spec.productName}
              onChange={(e) => updateField('productName', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label htmlFor="pkg-brand" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Nama Merek UMKM
            </label>
            <input
              id="pkg-brand"
              type="text"
              list="umkm-brand-list"
              value={spec.brandName}
              onChange={(e) => updateField('brandName', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
            <datalist id="umkm-brand-list">
              {umkmPartners.map((u) => (
                <option key={u.id} value={u.businessName} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor="pkg-flavor" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Varian Rasa
            </label>
            <input
              id="pkg-flavor"
              type="text"
              value={spec.flavorVariant}
              onChange={(e) => updateField('flavorVariant', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label htmlFor="pkg-format" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Jenis Kemasan
            </label>
            <select
              id="pkg-format"
              value={spec.format}
              onChange={(e) => updateField('format', e.target.value as PackagingFormat)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            >
              {FORMAT_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pkg-style" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Gaya Visual
            </label>
            <select
              id="pkg-style"
              value={spec.style}
              onChange={(e) => updateField('style', e.target.value as PackagingStyle)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            >
              {STYLE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pkg-weight" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Berat Bersih
            </label>
            <input
              id="pkg-weight"
              type="text"
              value={spec.netWeight}
              onChange={(e) => updateField('netWeight', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div>
            <label htmlFor="pkg-wa" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Kontak WhatsApp
            </label>
            <input
              id="pkg-wa"
              type="text"
              value={spec.contactWhatsapp}
              onChange={(e) => updateField('contactWhatsapp', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="pkg-tagline" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Tagline Kemasan
            </label>
            <input
              id="pkg-tagline"
              type="text"
              value={spec.tagline}
              onChange={(e) => updateField('tagline', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="pkg-pirt" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Info Wajib Label (P-IRT / Produksi Wonoayu, Sidoarjo)
            </label>
            <input
              id="pkg-pirt"
              type="text"
              value={spec.pirtNumber}
              onChange={(e) => updateField('pirtNumber', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            />
          </div>
        </div>

        <div>
          <span className="block text-xs font-semibold text-[#1C1917] mb-2">
            Nuansa Warna Kemasan
          </span>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_PALETTES.map((p) => {
              const selected = spec.primaryColor === p.primary && spec.accentColor === p.accent;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    onChangeSpec({
                      ...spec,
                      primaryColor: p.primary,
                      secondaryColor: p.secondary,
                      accentColor: p.accent,
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                    selected
                      ? 'border-[#C2410C] bg-orange-50/50 font-semibold'
                      : 'border-[#E7DFD3] hover:border-[#C2410C]/60'
                  }`}
                >
                  <span className="flex items-center -space-x-1 shrink-0">
                    <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.primary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.secondary }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-white" style={{ backgroundColor: p.accent }} />
                  </span>
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerateAiConcept}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Merancang Desain & Emblem AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Desain Kemasan AI</span>
            </>
          )}
        </button>
      </div>

      {/* Preview & Export Column */}
      <div className="xl:col-span-7 bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="inline-flex p-1 bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg">
            {(
              [
                { id: 'mockup', label: 'Mockup Kemasan' },
                { id: 'sticker', label: 'Stiker Label' },
                { id: 'logo', label: 'Logo Brand' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-[#C2410C] shadow-sm'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer text-[#1C1917]">
              <input
                type="checkbox"
                checked={spec.kraftTexture}
                onChange={(e) => updateField('kraftTexture', e.target.checked)}
                className="accent-[#C2410C]"
              />
              <span>Tekstur Kraft</span>
            </label>
            {activeTab === 'sticker' && (
              <label className="inline-flex items-center gap-2 cursor-pointer text-[#1C1917]">
                <input
                  type="checkbox"
                  checked={spec.showCutLine}
                  onChange={(e) => updateField('showCutLine', e.target.checked)}
                  className="accent-[#E11D48]"
                />
                <span>Garis Potong</span>
              </label>
            )}
          </div>
        </div>

        <PackagingPreviewCanvas spec={spec} activeTab={activeTab} svgRef={svgRef} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E7DFD3]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#78716C]">Rating Desain:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-0.5 cursor-pointer"
                  aria-label={`Beri rating desain ${s}`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      rating >= s ? 'fill-amber-400 text-amber-500' : 'text-[#D6D3D1]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleShareWhatsapp}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#047857] bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan WA</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg cursor-pointer"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Tersimpan</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Katalog</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1C1917] border border-[#E7DFD3] hover:bg-[#FAF7F2] rounded-lg cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>SVG</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={exportingPng}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingPng ? 'Memproses...' : 'Unduh PNG'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
