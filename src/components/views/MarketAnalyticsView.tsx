import React, { useState } from 'react';
import {
  Lightbulb,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  BusinessInsight,
  FlavorTrendSeries,
  MarketAnalysisResult,
  MarketingChannelStat,
  ProductCatalogItem,
  UmkmPartner,
  UserAccount,
} from '../../types';
import { formatNumber } from '../../utils/format';

interface MarketAnalyticsViewProps {
  flavorTrends: FlavorTrendSeries[];
  marketingChannels: MarketingChannelStat[];
  insights: BusinessInsight[];
  catalog: ProductCatalogItem[];
  umkmPartners: UmkmPartner[];
  currentUser: UserAccount;
  onUpdateInsights: (next: BusinessInsight[]) => void;
  onQuotaIncrement: (used: number) => void;
}

export function MarketAnalyticsView({
  flavorTrends,
  marketingChannels,
  insights,
  catalog,
  umkmPartners,
  currentUser,
  onUpdateInsights,
  onQuotaIncrement,
}: MarketAnalyticsViewProps) {
  const [keyword, setKeyword] = useState('Singkong Keju Lumer');
  const [targetArea, setTargetArea] = useState('Wonoayu & Sidoarjo Barat');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<MarketAnalysisResult | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<FlavorTrendSeries | null>(null);

  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const [insightError, setInsightError] = useState<string | null>(null);

  // Interactive Business & Licensing AI Assistant (PRD Section 10.3 Fase 3)
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { role: 'user' | 'assistant'; text: string }[]
  >([
    {
      role: 'assistant',
      text: 'Halo! Saya Asisten Bisnis & Perizinan KemasKini Wonoayu. Silakan tanyakan seputar cara urus NIB/P-IRT/Halal, strategi bundling bazar, atau penentuan harga produk.',
    },
  ]);
  const [isAskingAi, setIsAskingAi] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          keyword: keyword.trim(),
          targetArea,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menjalankan analisis pasar AI.');
      }
      if (data.quota?.used) onQuotaIncrement(data.quota.used);
      setAnalysis(data.analysis as MarketAnalysisResult);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Terjadi kesalahan saat menganalisis pasar.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);
    setInsightError(null);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          catalogSummary: catalog.map((c) => ({
            name: c.name,
            baseIngredient: c.baseIngredient,
            flavorTrend: c.flavorTrend,
            lifecycleStatus: c.lifecycleStatus,
            packagingStatus: c.packagingStatus,
          })),
          umkmSummary: umkmPartners.map((u) => ({
            businessName: u.businessName,
            village: u.village,
            status: u.status,
            readiness: u.readiness,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal memperbarui insight prioritisasi.');
      }
      if (data.quota?.used) onQuotaIncrement(data.quota.used);
      const next: BusinessInsight[] = (data.insights ?? []).map(
        (item: Record<string, unknown>, idx: number) => ({
          id: `ins-ai-${Date.now()}-${idx}`,
          category: (item.category as BusinessInsight['category']) || 'Peluang Pasar',
          title: String(item.title ?? 'Rekomendasi Prioritas'),
          finding: String(item.finding ?? ''),
          recommendation: String(item.recommendation ?? ''),
          expectedImpact: String(item.expectedImpact ?? ''),
          priority: item.priority === 'Tinggi' ? 'Tinggi' : 'Sedang',
        })
      );
      if (next.length > 0) onUpdateInsights(next);
    } catch (err) {
      setInsightError(
        err instanceof Error ? err.message : 'Gagal memperbarui insight prioritisasi.'
      );
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  const handleAskAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = chatQuestion.trim();
    if (!q || isAskingAi) return;
    setChatHistory((prev) => [...prev, { role: 'user', text: q }]);
    setChatQuestion('');
    setIsAskingAi(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          question: q,
          context: {
            userRole: currentUser.role,
            village: currentUser.village,
            totalUmkm: umkmPartners.length,
            totalProducts: catalog.length,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghubungi asisten AI.');
      if (data.quota?.used) onQuotaIncrement(data.quota.used);
      setChatHistory((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err instanceof Error
              ? err.message
              : 'Maaf, terjadi kendala saat menghubungi asisten.',
        },
      ]);
    } finally {
      setIsAskingAi(false);
    }
  };

  // Legality Readiness Summary (PRD Section 3.2 & Lampiran D)
  const nibCount = umkmPartners.filter((u) => u.readiness.nib).length;
  const pirtCount = umkmPartners.filter((u) => u.readiness.pirt).length;
  const halalCount = umkmPartners.filter((u) => u.readiness.halal).length;

  const chartW = 560;
  const chartH = 220;
  const padL = 36;
  const padR = 20;
  const padT = 20;
  const padB = 34;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const getPoint = (idx: number, val: number) => {
    const x = padL + (idx / Math.max(flavorTrends.length - 1, 1)) * innerW;
    const y = padT + innerH - (val / 100) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const seriesConfig = [
    { key: 'pedasNampol' as const, label: 'Pedas Nampol', color: '#C2410C' },
    { key: 'mentai' as const, label: 'Mentai Creamy', color: '#D97706' },
    { key: 'kejuLumer' as const, label: 'Keju Lumer', color: '#047857' },
    { key: 'matchaTiramisu' as const, label: 'Matcha/Tiramisu', color: '#1E3A5F' },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: Flavor Trend Chart & Legality Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-[#E7DFD3] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#1C1917]">
                Tren Varian Rasa Kuliner Wonoayu (6 Bulan)
              </h2>
              <p className="text-xs text-[#78716C]">
                Arahkan kursor ke titik bulan untuk membandingkan indeks permintaan.
              </p>
            </div>
            {hoveredMonth && (
              <div className="text-xs font-mono tabular-nums bg-[#FAF7F2] border border-[#E7DFD3] px-3 py-1.5 rounded-lg">
                <strong>{hoveredMonth.month}</strong> · Pedas {hoveredMonth.pedasNampol} · Mentai{' '}
                {hoveredMonth.mentai} · Keju {hoveredMonth.kejuLumer}
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto min-w-[440px]">
              {[25, 50, 75, 100].map((tick) => {
                const y = padT + innerH - (tick / 100) * innerH;
                return (
                  <g key={tick}>
                    <line
                      x1={padL}
                      y1={y}
                      x2={chartW - padR}
                      y2={y}
                      stroke="#E7DFD3"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#78716C"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {seriesConfig.map((s) => (
                <polyline
                  key={s.key}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={flavorTrends.map((pt, i) => getPoint(i, pt[s.key])).join(' ')}
                />
              ))}

              {flavorTrends.map((pt, i) => {
                const x = padL + (i / Math.max(flavorTrends.length - 1, 1)) * innerW;
                return (
                  <g
                    key={pt.month}
                    onMouseEnter={() => setHoveredMonth(pt)}
                    onMouseLeave={() => setHoveredMonth(null)}
                    className="cursor-pointer"
                  >
                    <rect x={x - 18} y={padT} width="36" height={innerH} fill="transparent" />
                    {seriesConfig.map((s) => {
                      const y = padT + innerH - (pt[s.key] / 100) * innerH;
                      return (
                        <circle
                          key={s.key}
                          cx={x}
                          cy={y}
                          r={hoveredMonth?.month === pt.month ? 5 : 3.5}
                          fill={s.color}
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                      );
                    })}
                    <text
                      x={x}
                      y={chartH - 10}
                      textAnchor="middle"
                      fill="#57534E"
                      fontSize="11"
                      fontFamily="DM Sans, sans-serif"
                    >
                      {pt.month}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#57534E]">
            {seriesConfig.map((s) => (
              <div key={s.key} className="inline-flex items-center gap-1.5">
                <span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Legality & Packaging Adoption Summary */}
        <section className="lg:col-span-5 bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#1C1917]">
            Kesiapan Legalitas & Kanal Pemasaran
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Kepemilikan NIB (OSS)', count: nibCount, total: umkmPartners.length, color: 'bg-[#1E3A5F]' },
              { label: 'Izin Edar P-IRT', count: pirtCount, total: umkmPartners.length, color: 'bg-[#C2410C]' },
              { label: 'Sertifikat Halal', count: halalCount, total: umkmPartners.length, color: 'bg-[#047857]' },
            ].map((row) => {
              const pct = Math.round((row.count / Math.max(row.total, 1)) * 100);
              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#1C1917]">{row.label}</span>
                    <span className="font-mono tabular-nums text-[#57534E]">
                      {row.count}/{row.total} UMKM ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden">
                    <div className={`h-full ${row.color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E7DFD3]">
            <div className="text-xs font-semibold text-[#1C1917] mb-2">
              Konversi Kanal Digital Teratas
            </div>
            <div className="space-y-1.5 text-xs font-mono tabular-nums">
              {marketingChannels.map((ch) => (
                <div key={ch.channel} className="flex justify-between text-[#57534E]">
                  <span className="font-sans truncate pr-2">{ch.channel}</span>
                  <span className="font-semibold text-[#047857]">
                    {formatNumber(ch.orders)} order ({ch.conversionRate}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Row 2: PRD Section 8.3 Logika Insight & Prioritisasi */}
      <section className="bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold text-[#1C1917]">
              Insight Otomatis & Logika Prioritisasi Pembinaan
            </h2>
            <p className="text-xs text-[#78716C]">
              Mendeteksi komoditas dominan, produk kemasan polos, kesenjangan legalitas P-IRT/Halal, dan desa sasaran sosialisasi.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefreshInsights}
            disabled={isRefreshingInsights}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#152B47] disabled:opacity-60 rounded-lg cursor-pointer shrink-0"
          >
            {isRefreshingInsights ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Perbarui Insight AI</span>
          </button>
        </div>

        {insightError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {insightError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((ins) => (
            <article
              key={ins.id}
              className="p-4 rounded-xl border border-[#E7DFD3] bg-[#FAF7F2] space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#C2410C]">
                  {ins.category} · Prioritas {ins.priority}
                </span>
                <Lightbulb className="w-4 h-4 text-[#D97706]" />
              </div>
              <h3 className="font-display text-sm font-bold text-[#1C1917]">{ins.title}</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">{ins.finding}</p>
              <div className="text-xs text-[#1C1917] bg-white p-2.5 rounded-lg border border-[#E7DFD3]">
                <strong className="text-[#047857]">Rekomendasi:</strong> {ins.recommendation}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Row 3: Market Research AI + Interactive Business/Licensing Assistant (Fase 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-white border border-[#E7DFD3] rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#1C1917]">
              Riset Peluang Pasar Lokal AI
            </h2>
            <p className="text-xs text-[#78716C]">
              Uji daya serap pasar untuk menu atau bahan baku baru di sekitar Wonoayu.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Mis. Ketan Mentai, Pisang Salted Egg..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={targetArea}
                onChange={(e) => setTargetArea(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg"
              >
                <option value="Wonoayu & Sidoarjo Barat">Wonoayu & Sidoarjo Barat</option>
                <option value="Krian & Prambon">Krian & Prambon</option>
                <option value="Pusat Kota Sidoarjo">Pusat Kota Sidoarjo</option>
              </select>
              <button
                type="submit"
                disabled={isAnalyzing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
              >
                {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Analisis</span>
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          {analysis && (
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DFD3] space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#1C1917]">
                <span>{analysis.keyword}</span>
                <span className="text-[#047857]">
                  {analysis.demandLevel} ({analysis.demandIndex}/100)
                </span>
              </div>
              <div className="text-[#57534E]">
                Harga ideal: <strong>{analysis.recommendedPriceRange}</strong> · Jam ramai:{' '}
                <strong>{analysis.peakHours}</strong>
              </div>
              <p className="text-[#57534E]">{analysis.competitorGap}</p>
              <p className="text-[#1E3A5F] font-medium">{analysis.localChannelStrategy}</p>
            </div>
          )}
        </section>

        {/* AI Assistant Konsultasi Bisnis & Perizinan (PRD Section 10.3 Fase 3) */}
        <section className="lg:col-span-6 bg-white border border-[#E7DFD3] rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-[#1C1917]">
                Asisten Konsultasi Bisnis & Perizinan AI
              </h2>
              <MessageSquareText className="w-4 h-4 text-[#047857]" />
            </div>
            <p className="text-xs text-[#78716C] mt-0.5">
              Tanyakan cara daftar NIB OSS, syarat P-IRT, sertifikasi Halal gratis, atau strategi jualan bazar.
            </p>
          </div>

          <div className="flex-1 max-h-60 overflow-y-auto space-y-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#E7DFD3]">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-[#1E3A5F] text-white ml-8'
                    : 'bg-white border border-[#E7DFD3] text-[#1C1917] mr-8'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleAskAssistant} className="flex gap-2">
            <input
              type="text"
              value={chatQuestion}
              onChange={(e) => setChatQuestion(e.target.value)}
              placeholder="Contoh: Apa syarat mengurus P-IRT untuk singkong keju?"
              className="flex-1 px-3 py-2 text-xs bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg focus:outline-none focus:border-[#047857]"
            />
            <button
              type="submit"
              disabled={isAskingAi}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg cursor-pointer"
            >
              {isAskingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Tanya</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
