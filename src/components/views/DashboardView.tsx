import React, { useState } from 'react';
import {
  Award,
  ChefHat,
  Download,
  FileWarning,
  MapPin,
  Megaphone,
  Package,
  Store,
} from 'lucide-react';
import {
  CurationRecord,
  FlavorTrendSeries,
  NavSection,
  ProductCatalogItem,
  UmkmPartner,
} from '../../types';
import { formatRp } from '../../utils/format';

interface DashboardViewProps {
  catalog: ProductCatalogItem[];
  umkmPartners: UmkmPartner[];
  curations: CurationRecord[];
  flavorTrends: FlavorTrendSeries[];
  onNavigate: (section: NavSection) => void;
  onOpenProductInPackaging: (product: ProductCatalogItem) => void;
}

export function DashboardView({
  catalog,
  umkmPartners,
  curations,
  flavorTrends,
  onNavigate,
  onOpenProductInPackaging,
}: DashboardViewProps) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const totalUmkm = umkmPartners.length;
  const totalProducts = catalog.length;
  const readyPackagingCount = catalog.filter((p) => p.packagingStatus === 'Siap Cetak').length;
  const packagingAdoptionRate =
    totalProducts > 0 ? Math.round((readyPackagingCount / totalProducts) * 100) : 0;

  const readyBazarCount = curations.filter((c) => c.decision === 'Siap Bazar').length;
  const missingPirtHalalCount = umkmPartners.filter(
    (u) => !u.readiness.pirt || !u.readiness.halal
  ).length;

  // Village distribution from actual UMKM data
  const villageCounts = umkmPartners.reduce<Record<string, number>>((acc, u) => {
    acc[u.village] = (acc[u.village] ?? 0) + 1;
    return acc;
  }, {});
  const sortedVillages = Object.entries(villageCounts).sort((a, b) => b[1] - a[1]);

  // Commodity popularity
  const commodityCounts = catalog.reduce<Record<string, number>>((acc, c) => {
    const key = c.baseIngredient.split(',')[0].trim();
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topCommodity = Object.entries(commodityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Singkong & Ketan';

  const latestTrend = flavorTrends[flavorTrends.length - 1];

  const lifecycleOrder = [
    'Draf Ide',
    'Uji Coba Dapur',
    'Kemasan Siap',
    'Terkurasi',
    'Siap Bazar',
  ] as const;

  return (
    <div className="space-y-7">
      {/* Brand Tagline & Quick Actions Strip (PRD Section 7.2 & 14.2) */}
      <section className="bg-white border border-[#E7DFD3] rounded-xl p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="max-w-xl">
          <p className="text-xs font-semibold text-[#C2410C]">
            KemasKini AI — Asisten Inovasi UMKM Wonoayu
          </p>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#1C1917] leading-snug">
            Olahan Tradisional, Tampilan Kekinian, Siap Menembus Pasar Modern.
          </h2>
          <p className="mt-1.5 text-sm text-[#57534E]">
            Pilih aksi cepat di bawah untuk mulai meracik menu fusion, membuat kemasan profesional, atau menulis caption promosi siap pakai.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('recipes')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-[#C2410C] hover:bg-[#9A3412] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <ChefHat className="w-4 h-4 shrink-0" />
            <span>Buat Resep Kekinian</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('packaging')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-[#047857] hover:bg-[#065F46] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Desain Kemasan Baru</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('promo')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>Buat Caption Promosi</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-[#1C1917] border border-[#E7DFD3] bg-white hover:bg-[#FAF7F2] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Store className="w-4 h-4 shrink-0" />
            <span>Etalase Wonoayu</span>
          </button>
        </div>
      </section>

      {/* PRD Section 3.2 KPI Grid */}
      <section aria-label="Ringkasan KPI Kecamatan Wonoayu">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="bg-white border border-[#E7DFD3] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-medium text-[#78716C]">
              <span>Total UMKM Terdaftar</span>
              <Store className="w-4 h-4 text-[#1E3A5F]" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span className="font-mono tabular-nums text-3xl font-bold text-[#1C1917]">
                {totalUmkm}
              </span>
              <span className="text-xs text-[#047857] font-semibold">
                {sortedVillages.length} desa aktif
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[#78716C]">
              Pelaku kuliner binaan Kecamatan Wonoayu
            </p>
          </div>

          <div className="bg-white border border-[#E7DFD3] rounded-xl p-5">
            <div className="flex items-center justify-between text-xs font-medium text-[#78716C]">
              <span>Produk Terinovasi & Adopsi Kemasan</span>
              <Package className="w-4 h-4 text-[#C2410C]" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-3">
              <span className="font-mono tabular-nums text-3xl font-bold text-[#1C1917]">
                {totalProducts}
              </span>
              <span className="font-mono tabular-nums text-xs font-semibold text-[#047857]">
                Adopsi kemasan {packagingAdoptionRate}% ({readyPackagingCount} siap cetak)
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[#78716C]">
              Komoditas terpopuler: <strong className="text-[#1C1917]">{topCommodity}</strong>
            </p>
          </div>

          <div className="bg-white border border-[#E7DFD3] rounded-xl p-5 sm:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between text-xs font-medium text-[#78716C]">
              <span>Status Kurasi & Legalitas</span>
              <Award className="w-4 h-4 text-[#047857]" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-3">
              <span className="font-mono tabular-nums text-3xl font-bold text-[#1C1917]">
                {readyBazarCount}
              </span>
              <span className="text-xs font-semibold text-[#047857]">
                Produk Siap Bazar
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#B45309]">
              <FileWarning className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono tabular-nums">
                {missingPirtHalalCount} UMKM perlu fasilitasi P-IRT/Halal
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Sebaran Desa + Status Produk Pipeline + Tren Rasa */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 bg-white border border-[#E7DFD3] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base font-bold text-[#1C1917]">
              Sebaran UMKM per Desa di Wonoayu
            </h3>
            <MapPin className="w-4 h-4 text-[#1E3A5F]" />
          </div>
          <div className="space-y-3">
            {sortedVillages.map(([village, count]) => {
              const pct = Math.round((count / Math.max(totalUmkm, 1)) * 100);
              return (
                <div key={village} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#1C1917]">{village}</span>
                    <span className="font-mono tabular-nums text-[#1E3A5F] font-semibold">
                      {count} usaha ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#FAF7F2] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E3A5F] rounded-full"
                      style={{ width: `${Math.max(12, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="lg:col-span-7 bg-white border border-[#E7DFD3] rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <h3 className="font-display text-base font-bold text-[#1C1917]">
              Progres Siklus Produk UMKM (Dari Draf ke Bazar)
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Pantau berapa produk yang telah melewati Uji Coba Dapur dan Kurasi Kecamatan.
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {lifecycleOrder.map((stage) => {
                const count = catalog.filter((p) => p.lifecycleStatus === stage).length;
                return (
                  <div
                    key={stage}
                    className="p-3 rounded-lg border border-[#E7DFD3] bg-[#FAF7F2]"
                  >
                    <div className="font-mono tabular-nums text-xl font-bold text-[#1C1917]">
                      {count}
                    </div>
                    <div className="text-[11px] font-medium text-[#57534E] mt-1 leading-tight">
                      {stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#57534E]">
              Tren rasa terlaris bulan ini:{' '}
              <strong className="text-[#C2410C]">
                Pedas Nampol ({latestTrend?.pedasNampol ?? 95})
              </strong>{' '}
              · Mentai ({latestTrend?.mentai ?? 93}) · Keju Lumer ({latestTrend?.kejuLumer ?? 87})
            </div>
            <button
              type="button"
              onClick={() => onNavigate('curation')}
              className="text-xs font-semibold text-[#1E3A5F] hover:text-[#C2410C] whitespace-nowrap cursor-pointer"
            >
              Buka Modul Kurasi & Uji Coba →
            </button>
          </div>
        </section>
      </div>

      {/* Product Showcase */}
      <section className="bg-white border border-[#E7DFD3] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-lg font-bold text-[#1C1917]">
              Produk Inovasi & Mockup Kemasan Terbaru
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">
              Klik untuk meninjau ulang desain di Studio Kemasan atau mengunduh file siap cetak.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('catalog')}
            className="text-xs font-semibold text-[#C2410C] hover:text-[#9A3412] whitespace-nowrap cursor-pointer"
          >
            Kelola Semua di Katalog Produk Saya →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {catalog.slice(0, 4).map((product) => {
            const hasImage = product.imageUrl && !imgErrors[product.id];
            return (
              <article
                key={product.id}
                className="flex flex-col border border-[#E7DFD3] rounded-xl overflow-hidden bg-[#FAF7F2]"
              >
                <div className="aspect-[4/3] w-full bg-[#EFE9DD] relative overflow-hidden">
                  {hasImage ? (
                    <img
                      src={product.imageUrl}
                      alt={`${product.name} - ${product.packagingFormat}`}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setImgErrors((prev) => ({ ...prev, [product.id]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#F4ECE1] to-[#E7DFD3]">
                      <Package className="w-8 h-8 text-[#C2410C] mb-2" />
                      <span className="font-display text-sm font-bold text-[#1C1917]">
                        {product.name}
                      </span>
                      <span className="text-xs text-[#78716C] mt-1">
                        {product.packagingFormat}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="text-xs text-[#78716C] truncate">
                      {product.brandName} · {product.lifecycleStatus}
                    </div>
                    <h4 className="mt-1 font-display text-sm font-bold text-[#1C1917] leading-snug">
                      {product.name}
                    </h4>
                    <div className="mt-2 pt-2 border-t border-[#E7DFD3] flex items-center justify-between text-xs font-mono tabular-nums">
                      <span className="font-bold text-[#1C1917]">
                        {formatRp(product.sellingPrice)}
                      </span>
                      <span className="text-[#047857] font-semibold">
                        Margin {product.marginPercent}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenProductInPackaging(product)}
                    className="mt-3 w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#1E3A5F] bg-[#F4ECE1] hover:bg-[#E7DFD3] rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Review & Unduh Kemasan</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
