import React, { useState } from 'react';
import { Download, FileText, Loader2, Printer, Sparkles } from 'lucide-react';
import {
  CurationRecord,
  KitchenTrial,
  ManagementBrief,
  ProductCatalogItem,
  UmkmPartner,
  UserAccount,
} from '../../types';
import { downloadCsv, formatRp } from '../../utils/format';

interface ReportsViewProps {
  catalog: ProductCatalogItem[];
  umkmPartners: UmkmPartner[];
  trials: KitchenTrial[];
  curations: CurationRecord[];
  brief: ManagementBrief;
  currentUser: UserAccount;
  onUpdateBrief: (next: ManagementBrief) => void;
  onQuotaIncrement: (used: number) => void;
}

export function ReportsView({
  catalog,
  umkmPartners,
  trials,
  curations,
  brief,
  currentUser,
  onUpdateBrief,
  onQuotaIncrement,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<'brief' | 'catalog' | 'umkm'>('brief');
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          quotaLimit: currentUser.dailyQuotaLimit,
          period: 'November 2026',
          statsSummary: {
            totalUmkm: umkmPartners.length,
            villagesCovered: [...new Set(umkmPartners.map((u) => u.village))],
            totalProducts: catalog.length,
            readyPackagingCount: catalog.filter((p) => p.packagingStatus === 'Siap Cetak').length,
            trialsCount: trials.length,
            curatedCount: curations.filter((c) => c.decision !== 'Perlu Revisi').length,
            bazarReadyCount: curations.filter((c) => c.decision === 'Siap Bazar').length,
            nibReady: umkmPartners.filter((u) => u.readiness.nib).length,
            pirtReady: umkmPartners.filter((u) => u.readiness.pirt).length,
            halalReady: umkmPartners.filter((u) => u.readiness.halal).length,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyusun Management Brief.');
      if (data.quota?.used) onQuotaIncrement(data.quota.used);
      if (data.brief) onUpdateBrief(data.brief as ManagementBrief);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleExportCsv = () => {
    if (activeTab === 'umkm') {
      downloadCsv(
        ['Nama Usaha', 'Pemilik', 'Desa', 'Komoditas', 'Status', 'Omzet/Bln', 'NIB', 'P-IRT', 'Halal'],
        umkmPartners.map((u) => [
          u.businessName,
          u.ownerName,
          u.village,
          u.mainCommodity,
          u.status,
          u.monthlyRevenueRp,
          u.readiness.nib ? 'Ya' : 'Belum',
          u.readiness.pirt ? 'Ya' : 'Belum',
          u.readiness.halal ? 'Ya' : 'Belum',
        ]),
        'laporan-umkm-kemaskini-wonoayu'
      );
    } else {
      downloadCsv(
        ['Produk', 'Brand', 'Bahan Utama', 'Tren Rasa', 'Status Siklus', 'Kemasan', 'HPP', 'Harga Jual', 'Margin (%)'],
        catalog.map((c) => [
          c.name,
          c.brandName,
          c.baseIngredient,
          c.flavorTrend,
          c.lifecycleStatus,
          c.packagingFormat,
          c.hpp,
          c.sellingPrice,
          c.marginPercent,
        ]),
        'laporan-katalog-kemaskini-wonoayu'
      );
    }
  };

  const briefSections = [
    { num: '01', title: 'Executive Summary', content: brief.executiveSummary },
    { num: '02', title: 'KPI Utama', content: brief.kpiHighlights },
    { num: '03', title: 'Sebaran Wilayah Kecamatan Wonoayu', content: brief.regionalSpread },
    { num: '04', title: 'Tren Komoditas & Rasa', content: brief.commodityAndFlavorTrends },
    { num: '05', title: 'Adopsi Kemasan Baru', content: brief.packagingAdoption },
    { num: '06', title: 'Kesiapan Legalitas (NIB / P-IRT / Halal)', content: brief.legalityReadiness },
    { num: '07', title: 'Insight Temuan Utama', content: brief.keyInsights },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="font-display text-lg font-bold text-[#1C1917]">
            Laporan Periodik & Management Brief Kecamatan
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            Ringkasan eksekutif 9 bagian siap cetak untuk Camat, Kasi Ekbang, dan Dinas Koperasi Sidoarjo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleGenerateBrief}
            disabled={isGeneratingBrief}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1E3A5F] hover:bg-[#152B47] rounded-lg cursor-pointer"
          >
            {isGeneratingBrief ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Susun Brief AI Terbaru</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#1C1917] bg-[#FAF7F2] border border-[#E7DFD3] rounded-lg cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV/Excel</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 no-print">
          {errorMsg}
        </div>
      )}

      {/* Sub-navigation */}
      <div className="inline-flex p-1 bg-white border border-[#E7DFD3] rounded-lg no-print">
        {(
          [
            { id: 'brief', label: 'Management Brief (9 Bagian)' },
            { id: 'catalog', label: 'Tabel Katalog Produk' },
            { id: 'umkm', label: 'Tabel Kesiapan UMKM' },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              activeTab === t.id ? 'bg-[#1E3A5F] text-white' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'brief' && (
        <article className="bg-white border border-[#E7DFD3] rounded-xl p-8 space-y-6">
          <div className="border-b border-[#E7DFD3] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-[#C2410C]">
                MANAGEMENT BRIEF KEMASKINI · KECAMATAN WONOAYU
              </div>
              <h3 className="font-display text-2xl font-bold text-[#1C1917] mt-1">
                Laporan Perkembangan Inovasi & Digitalisasi UMKM ({brief.period})
              </h3>
            </div>
            <div className="text-xs font-mono text-[#78716C] flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Diperbarui {brief.generatedAt}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {briefSections.map((sec) => (
              <div key={sec.num} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DFD3]">
                <div className="font-mono text-xs font-bold text-[#1E3A5F]">
                  {sec.num}. {sec.title}
                </div>
                <p className="mt-1.5 text-xs text-[#1C1917] leading-relaxed">{sec.content}</p>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7DFD3]">
              <div className="font-mono text-xs font-bold text-[#047857]">
                08. Rekomendasi Tindak Lanjut
              </div>
              <ul className="mt-1.5 list-disc list-inside text-xs text-[#1C1917] space-y-1">
                {brief.actionRecommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#1E3A5F] text-white">
            <div className="font-mono text-xs font-bold text-orange-300">09. Penutup</div>
            <p className="mt-1 text-xs text-slate-200 leading-relaxed">{brief.closingNote}</p>
          </div>
        </article>
      )}

      {activeTab === 'catalog' && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFD3] text-[#78716C]">
                <th className="py-3 pr-4 font-semibold">Produk & Brand</th>
                <th className="py-3 px-3 font-semibold">Bahan & Tren</th>
                <th className="py-3 px-3 font-semibold">Status Siklus</th>
                <th className="py-3 px-3 font-semibold">Kemasan</th>
                <th className="py-3 px-3 font-semibold text-right">HPP</th>
                <th className="py-3 pl-3 font-semibold text-right">Harga Jual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DFD3]">
              {catalog.map((c) => (
                <tr key={c.id}>
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-[#1C1917]">{c.name}</div>
                    <div className="text-[#78716C]">{c.brandName}</div>
                  </td>
                  <td className="py-3 px-3 text-[#57534E]">
                    {c.baseIngredient} · {c.flavorTrend}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[#047857]">{c.lifecycleStatus}</td>
                  <td className="py-3 px-3 text-[#57534E]">{c.packagingFormat}</td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">{formatRp(c.hpp)}</td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums font-bold">
                    {formatRp(c.sellingPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'umkm' && (
        <div className="bg-white border border-[#E7DFD3] rounded-xl p-6 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E7DFD3] text-[#78716C]">
                <th className="py-3 pr-4 font-semibold">UMKM & Pemilik</th>
                <th className="py-3 px-3 font-semibold">Desa</th>
                <th className="py-3 px-3 font-semibold">Status</th>
                <th className="py-3 px-3 font-semibold">NIB</th>
                <th className="py-3 px-3 font-semibold">P-IRT</th>
                <th className="py-3 px-3 font-semibold">Halal</th>
                <th className="py-3 pl-3 font-semibold text-right">Omzet/Bln</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7DFD3]">
              {umkmPartners.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-4">
                    <div className="font-semibold text-[#1C1917]">{u.businessName}</div>
                    <div className="text-[#78716C]">{u.ownerName}</div>
                  </td>
                  <td className="py-3 px-3 text-[#57534E]">{u.village}</td>
                  <td className="py-3 px-3 font-medium text-[#1E3A5F]">{u.status}</td>
                  <td className="py-3 px-3">{u.readiness.nib ? 'Ada' : 'Belum'}</td>
                  <td className="py-3 px-3">{u.readiness.pirt ? 'Ada' : 'Belum'}</td>
                  <td className="py-3 px-3">{u.readiness.halal ? 'Ada' : 'Belum'}</td>
                  <td className="py-3 pl-3 text-right font-mono tabular-nums font-bold">
                    {formatRp(u.monthlyRevenueRp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
