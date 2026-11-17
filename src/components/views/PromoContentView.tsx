import React, { useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  Loader2,
  Megaphone,
  Share2,
  Sparkles,
  Star,
} from 'lucide-react';
import {
  MarketingContentRecord,
  ProductCatalogItem,
  PromoCopywriting,
  UserAccount,
} from '../../types';

interface PromoContentViewProps {
  catalog: ProductCatalogItem[];
  marketingHistory: MarketingContentRecord[];
  currentUser: UserAccount;
  onQuotaIncrement: (used: number) => void;
  onSaveContent: (record: MarketingContentRecord) => void;
  onRateContent: (id: string, rating: number) => void;
}

export function PromoContentView({
  catalog,
  marketingHistory,
  currentUser,
  onQuotaIncrement,
  onSaveContent,
  onRateContent,
}: PromoContentViewProps) {
  const [selectedProdId, setSelectedProdId] = useState(catalog[0]?.id ?? '');
  const [tone, setTone] = useState('Ramah, Hangat & Menggugah Selera');
  const [platform, setPlatform] =
    useState<MarketingContentRecord['platform']>('Semua Kanal');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeCopy, setActiveCopy] = useState<PromoCopywriting | null>(
    catalog[0]?.copywriting ?? null
  );
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedProduct =
    catalog.find((c) => c.id === selectedProdId) ?? catalog[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          productName: selectedProduct.name,
          brandName: selectedProduct.brandName,
          flavorVariant: selectedProduct.flavorTrend,
          targetConsumer: selectedProduct.targetConsumer,
          price: selectedProduct.sellingPrice,
          tone,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat konten promosi AI.');
      }

      if (data.quota?.used) {
        onQuotaIncrement(data.quota.used);
      }

      const cw = data.copywriting as PromoCopywriting;
      setActiveCopy(cw);

      const newRecord: MarketingContentRecord = {
        id: `mc-${Date.now()}`,
        umkmId: selectedProduct.umkmId,
        productName: selectedProduct.name,
        platform,
        tone,
        copywriting: cw,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setActiveRecordId(newRecord.id);
      onSaveContent(newRecord);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal menghubungi layanan AI.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const shareToWhatsapp = (text: string) => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const activeRecord = marketingHistory.find((m) => m.id === activeRecordId);

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <section className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              AI Copywriting & Skrip Video Pendek 30 Detik
            </h2>
            <p className="text-xs text-[#78716C] mt-1">
              Buat caption Instagram/TikTok, skrip video Reels/TikTok 30 detik, dan pesan broadcast WhatsApp siap sebar untuk produk Anda.
            </p>
          </div>
          <Megaphone className="w-5 h-5 text-[#C2410C] shrink-0" />
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-4">
            <label htmlFor="promo-prod" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Pilih Produk Katalog
            </label>
            <select
              id="promo-prod"
              value={selectedProdId}
              onChange={(e) => {
                setSelectedProdId(e.target.value);
                const found = catalog.find((p) => p.id === e.target.value);
                if (found) setActiveCopy(found.copywriting);
              }}
              className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            >
              {catalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.brandName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="promo-plat" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Fokus Kanal
            </label>
            <select
              id="promo-plat"
              value={platform}
              onChange={(e) =>
                setPlatform(e.target.value as MarketingContentRecord['platform'])
              }
              className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            >
              <option value="Semua Kanal">Semua Kanal</option>
              <option value="Instagram & TikTok">Instagram & TikTok</option>
              <option value="WhatsApp">WhatsApp</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="promo-tone" className="block text-xs font-semibold text-[#1C1917] mb-1">
              Gaya Bahasa
            </label>
            <select
              id="promo-tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#C2410C]"
            >
              <option value="Ramah, Hangat & Menggugah Selera">Ramah & Menggugah Selera</option>
              <option value="Santai Gaya Anak Muda Sidoarjo">Santai Anak Muda Sidoarjo</option>
              <option value="Promo Bazar & Flash Sale">Promo Bazar & Flash Sale</option>
              <option value="Elegan untuk Oleh-oleh & Hampers">Oleh-oleh & Hampers</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isGenerating || !selectedProduct}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 rounded-lg cursor-pointer transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Membuat...' : 'Generate'}</span>
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {errorMsg}
          </div>
        )}
      </section>

      {/* Output Cards */}
      {activeCopy && (
        <section className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card 1: Instagram & TikTok Caption */}
            <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-[#C2410C]">
                  Caption Instagram & TikTok
                </h3>
                <p className="mt-2.5 text-xs text-[#1C1917] leading-relaxed whitespace-pre-line">
                  {activeCopy.instagramCaption}
                </p>
                <div className="mt-3 text-xs font-medium text-[#1E3A5F]">
                  {activeCopy.hashtags.join(' ')}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyText(
                    `${activeCopy.instagramCaption}\n\n${activeCopy.hashtags.join(' ')}`,
                    'ig'
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1C1917] bg-[#FAF7F2] border border-[#E7DFD3] hover:border-[#C2410C] rounded-lg cursor-pointer"
              >
                {copiedKey === 'ig' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Caption</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: 30-Second Short Video Script */}
            <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-[#1E3A5F]">
                  Skrip Video Pendek 30 Detik
                </h3>
                <div className="mt-2.5 p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E7DFD3] text-xs text-[#C2410C] font-medium">
                  Hook 3 Detik: "{activeCopy.tiktokHook}"
                </div>
                <p className="mt-2.5 text-xs text-[#1C1917] leading-relaxed whitespace-pre-line">
                  {activeCopy.tiktokScript30s || activeCopy.tiktokHook}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyText(
                    `Hook: ${activeCopy.tiktokHook}\n\n${activeCopy.tiktokScript30s}`,
                    'script'
                  )
                }
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1C1917] bg-[#FAF7F2] border border-[#E7DFD3] hover:border-[#1E3A5F] rounded-lg cursor-pointer"
              >
                {copiedKey === 'script' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Skrip Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Skrip Video</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 3: WhatsApp Broadcast & Direct Share */}
            <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-display text-sm font-bold text-[#047857]">
                  Penawaran WhatsApp & Katalog
                </h3>
                <p className="mt-2.5 text-xs text-[#1C1917] leading-relaxed whitespace-pre-line">
                  {activeCopy.whatsappBroadcast}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyText(activeCopy.whatsappBroadcast, 'wa')}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1C1917] bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg cursor-pointer"
                >
                  {copiedKey === 'wa' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#047857]" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => shareToWhatsapp(activeCopy.whatsappBroadcast)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim ke WA</span>
                </button>
              </div>
            </div>
          </div>

          {activeRecord && (
            <div className="bg-white border border-[#E7DFD3] rounded-xl px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-[#78716C]">
                Beri nilai hasil konten promosi AI ini:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => onRateContent(activeRecord.id, star)}
                    className="p-0.5 cursor-pointer"
                    aria-label={`Rating konten ${star}`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        (activeRecord.rating ?? 0) >= star
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-[#D6D3D1]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* History List */}
      <section className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-[#1C1917]">
            Riwayat Konten Promosi Tersimpan
          </h3>
          <Clock className="w-4 h-4 text-[#78716C]" />
        </div>
        <div className="divide-y divide-[#E7DFD3]">
          {marketingHistory.map((item) => (
            <div
              key={item.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm font-semibold text-[#1C1917]">
                  {item.productName}
                </div>
                <div className="text-xs text-[#78716C]">
                  {item.platform} · {item.tone} · {item.createdAt}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveCopy(item.copywriting);
                  setActiveRecordId(item.id);
                }}
                className="text-xs font-semibold text-[#C2410C] hover:underline self-start sm:self-auto cursor-pointer"
              >
                Tampilkan Konten →
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
